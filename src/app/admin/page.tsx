'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  maxMembers: number;
  isActive: boolean;
  participants: { id: string }[];
  description: string;
  date: string;
  location: string;
  note: string;
  carAvailable: boolean;
  askCarAvailable: boolean;
}

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    note: '',
    carAvailable: false,
    askCarAvailable: false,
    maxMembers: 4,
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authedFlag = sessionStorage.getItem('adminAuthed');
      setAuthed(authedFlag === 'true');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthed(true);
        if (typeof window !== 'undefined') sessionStorage.setItem('adminAuthed', 'true');
      } else {
        setAuthError('パスワードが違います');
      }
    } catch {
      setAuthError('認証エラー');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      setError('イベントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchEvents();
  }, [authed]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error('イベントの作成に失敗しました');
      }

      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: '',
        note: '',
        carAvailable: false,
        askCarAvailable: false,
        maxMembers: 4,
      });
      setSuccess('イベントを作成しました');
      fetchEvents();
    } catch (error) {
      setError('イベントの作成に失敗しました');
    }
  };

  if (authed !== true) {
    return (
      <Container maxWidth="xs" sx={{ py: 8 }}>
        <Typography variant="h5" gutterBottom>管理者パスワード</Typography>
        <form onSubmit={handleAuth}>
          <TextField
            type="password"
            label="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            autoFocus
          />
          {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? '認証中...' : 'ログイン'}
          </Button>
        </form>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" color="secondary" onClick={() => router.push('/')}>ホームに戻る</Button>
      </Box>
      <Typography variant="h4" gutterBottom>管理画面</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                新規イベント作成
              </Typography>
              <form onSubmit={handleCreateEvent}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8} sx={{ display: 'flex' }}>
                    <TextField
                      fullWidth
                      label="イベント名"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
                    <TextField
                      select
                      fullWidth
                      label="募集人数"
                      value={newEvent.maxMembers}
                      onChange={(e) => setNewEvent({ ...newEvent, maxMembers: Number(e.target.value) })}
                      required
                      SelectProps={{ native: true }}
                    >
                      <option value={1}>1名</option>
                      <option value={2}>2名</option>
                      <option value={3}>3名</option>
                      <option value={4}>4名</option>
                      <option value={5}>5名</option>
                      <option value={99}>数名程度</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex' }}>
                    <TextField
                      fullWidth
                      label="概要"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      multiline
                      minRows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                    <TextField
                      fullWidth
                      label="開催日時"
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                    <TextField
                      fullWidth
                      label="場所"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <input
                        type="checkbox"
                        checked={newEvent.askCarAvailable}
                        onChange={e => setNewEvent({ ...newEvent, askCarAvailable: e.target.checked })}
                        style={{ marginRight: 8 }}
                      />
                      車で移動可否の質問を表示する
                    </label>
                  </Grid>
                  {newEvent.askCarAvailable && (
                    <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                      <TextField
                        select
                        fullWidth
                        label="車で移動可能か"
                        value={newEvent.carAvailable ? 'yes' : 'no'}
                        onChange={e => setNewEvent({ ...newEvent, carAvailable: e.target.value === 'yes' })}
                        required
                        SelectProps={{ native: true }}
                      >
                        <option value="no">不可</option>
                        <option value="yes">可能</option>
                      </TextField>
                    </Grid>
                  )}
                  <Grid item xs={12} sx={{ display: 'flex' }}>
                    <TextField
                      fullWidth
                      label="備考"
                      value={newEvent.note}
                      onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })}
                      multiline
                      minRows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex' }}>
                    <Button type="submit" variant="contained" color="primary">
                      イベントを作成
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
          {events.map(event => (
            <Card key={event.id} sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{event.title}</Typography>
                  <Button color="error" onClick={() => handleDeleteEvent(event.id)}>
                    イベント削除
                  </Button>
                </Box>
                <Typography color="textSecondary">募集人数: {event.maxMembers}名</Typography>
                <Typography color="textSecondary">状態: {event.isActive ? '募集中' : '募集終了'}</Typography>
                <Typography color="textSecondary">参加者数: {(event.participants ?? []).length}名</Typography>
                <Typography color="textSecondary">概要: {event.description || '-'}</Typography>
                <Typography color="textSecondary">開催日時: {event.date ? new Date(event.date).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</Typography>
                <Typography color="textSecondary">場所: {event.location || '-'}</Typography>
                <Typography color="textSecondary">備考: {event.note || '-'}</Typography>
                {event.askCarAvailable && (
                  <Typography color="textSecondary">車で移動可能: {event.carAvailable ? '可能' : '不可'}</Typography>
                )}
                {(event.participants ?? []).length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      参加者一覧:
                    </Typography>
                    {(event.participants ?? []).map((p: any) => (
                      <Typography key={p.id}>
                        {p.name} ({p.studentId})
                        {typeof p.carAvailable !== 'undefined' && (
                          <> - 車: {p.carAvailable ? '可能' : '不可'}</>
                        )}
                        {p.createdAt ? ` - ${new Date(p.createdAt).toLocaleString()}` : ''}
                      </Typography>
                    ))}
                  </Box>
                )}
                <Button color="warning" onClick={() => handleCloseEvent(event.id)} disabled={!event.isActive} sx={{ ml: 2 }}>
                  募集終了
                </Button>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Container>
  );

  function handleDeleteEvent(eventId: string) {
    if (!window.confirm('本当にこのイベントを削除しますか？')) return;
    fetch(`/api/events?id=${eventId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error();
        setSuccess('イベントを削除しました');
        fetchEvents();
      })
      .catch(() => setError('イベントの削除に失敗しました'));
  }

  async function handleCloseEvent(eventId: string) {
    try {
      const res = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId }),
      });
      if (!res.ok) throw new Error();
      setSuccess('募集を終了しました');
      fetchEvents();
    } catch {
      setError('募集終了に失敗しました');
    }
  }
} 