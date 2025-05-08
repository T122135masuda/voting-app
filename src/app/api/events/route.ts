import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// イベントの作成
export async function POST(request: Request) {
  try {
    const { title, maxMembers, description, date, location, note, carAvailable, askCarAvailable } = await request.json();

    // 入力値の検証
    if (!title || !maxMembers) {
      return NextResponse.json(
        { error: 'イベント名と募集人数は必須です' },
        { status: 400 }
      );
    }

    // イベントの作成
    const event = await prisma.event.create({
      data: {
        title,
        maxMembers,
        description,
        date: date ? new Date(date) : undefined,
        location,
        note,
        carAvailable,
        askCarAvailable,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'イベントの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// イベント一覧の取得
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        participants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'イベントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// イベント削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');
    if (!eventId) {
      return NextResponse.json({ error: 'イベントIDが必要です' }, { status: 400 });
    }
    // 参加者も一括削除
    await prisma.participant.deleteMany({ where: { eventId } });
    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({ message: 'イベントを削除しました' });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json({ error: 'イベントの削除に失敗しました' }, { status: 500 });
  }
}

// イベントの募集終了（isActiveをfalseにする）
export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'イベントIDが必要です' }, { status: 400 });
    }
    const event = await prisma.event.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error('Event close error:', error);
    return NextResponse.json({ error: '募集終了に失敗しました' }, { status: 500 });
  }
} 