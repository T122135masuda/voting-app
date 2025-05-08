import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, contextPromise: Promise<{ params: { id: string } }>) {
  try {
    const { params } = await contextPromise;
    const { name, studentId, carAvailable } = await request.json();
    const eventId = params.id;

    // 入力値の検証
    if (!name || !studentId) {
      return NextResponse.json(
        { error: '名前と学籍番号は必須です' },
        { status: 400 }
      );
    }

    // イベントの存在確認
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }

    // 募集終了チェック
    if (!event.isActive) {
      return NextResponse.json(
        { error: 'このイベントは募集を終了しています' },
        { status: 400 }
      );
    }

    // 定員チェック
    if (event.participants.length >= event.maxMembers) {
      return NextResponse.json(
        { error: '定員に達しました' },
        { status: 400 }
      );
    }

    // 参加登録
    try {
      const participant = await prisma.participant.create({
        data: {
          name,
          studentId,
          eventId,
          carAvailable: carAvailable === 'yes',
        },
      });

      // 定員に達した場合は募集を終了
      if (event.participants.length + 1 >= event.maxMembers) {
        await prisma.event.update({
          where: { id: eventId },
          data: { isActive: false },
        });
      }

      return NextResponse.json(participant);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'このイベントには既にこの学籍番号で登録されています' },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Participant registration error:', error);
    return NextResponse.json(
      { error: '参加登録に失敗しました' },
      { status: 500 }
    );
  }
} 