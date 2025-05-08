'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  maxMembers: number;
  isActive: boolean;
  participants: Participant[];
  description?: string;
  date?: string;
  location?: string;
  note?: string;
  askCarAvailable?: boolean;
  carAvailable?: boolean;
}

interface Participant {
  id: string;
  name: string;
  studentId: string;
  createdAt?: string;
  carAvailable?: boolean;
}

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // イベント一覧の取得
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      setError('イベントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 参加登録フォームの状態
  const [participant, setParticipant] = useState({
    name: '',
    studentId: '',
    carAvailable: 'no',
  });

  // 参加登録
  const handleRegister = async (eventId: string, askCarAvailable: boolean) => {
    try {
      const body = askCarAvailable
        ? JSON.stringify(participant)
        : JSON.stringify({ name: participant.name, studentId: participant.studentId });
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '参加登録に失敗しました');
      }

      setParticipant({ name: '', studentId: '', carAvailable: 'no' });
      setSuccess('参加登録が完了しました');
      fetchEvents();
    } catch (error) {
      setError(error instanceof Error ? error.message : '参加登録に失敗しました');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" color="secondary" onClick={() => router.push('/admin')}>
          管理画面へ
        </Button>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom>
        イベント参加システム
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* イベント一覧 */}
      <Typography variant="h5" gutterBottom>
        イベント一覧
      </Typography>
      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid item xs={12} key={event.id} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  募集人数: {event.maxMembers}名
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  概要: {event.description || '-'}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  開催日時: {event.date ? new Date(event.date).toLocaleString() : '-'}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  場所: {event.location || '-'}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  備考: {event.note || '-'}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  参加者数: {event.participants.length}名
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  状態: {event.isActive ? '募集中' : '募集終了'}
                </Typography>

                {event.isActive && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                        <TextField
                          fullWidth
                          label="名前"
                          value={participant.name}
                          onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                        <TextField
                          fullWidth
                          label="学籍番号"
                          value={participant.studentId}
                          onChange={(e) => setParticipant({ ...participant, studentId: e.target.value })}
                          required
                        />
                      </Grid>
                      {event.askCarAvailable && (
                        <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                          <TextField
                            select
                            fullWidth
                            label="車で移動可能か"
                            value={participant.carAvailable}
                            onChange={e => setParticipant({ ...participant, carAvailable: e.target.value })}
                            required
                            SelectProps={{ native: true }}
                          >
                            <option value="no">不可</option>
                            <option value="yes">可能</option>
                          </TextField>
                        </Grid>
                      )}
                      <Grid item xs={12} sx={{ display: 'flex' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleRegister(event.id, !!event.askCarAvailable)}
                          disabled={!participant.name || !participant.studentId || (event.askCarAvailable && !participant.carAvailable)}
                        >
                          参加登録
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* 参加者一覧 */}
                {event.participants.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      参加者一覧:
                    </Typography>
                    {event.participants.map((p) => (
                      <Typography key={p.id}>
                        {p.name} ({p.studentId})
                        {typeof p.carAvailable !== 'undefined' && (
                          <> - 車: {p.carAvailable ? '可能' : '不可'}</>
                        )}
                        {p.createdAt && <> - {new Date(p.createdAt).toLocaleString()}</>}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
