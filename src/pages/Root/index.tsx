import { routes } from '@app/Routes/routes';
import { PageMain } from '@app/components/PageMain';
import { rpc } from '@app/rpc';
import { Button, Card, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Root: FC = () => {
  const navigate = useNavigate();

  const gamesQuery = useQuery({
    queryKey: ['rpc.authenticated.games'],
    queryFn: () => rpc.authenticated.games(),
    placeholderData: keepPreviousData,
  });

  const gamesData = gamesQuery.data;
  const games = gamesData?.status === 'authorized' ? gamesData.data.games : null;

  const createGameMutation = useMutation({
    mutationFn: () => rpc.authenticated.createGame(),
    onSuccess: (res) => {
      if (res.status !== 'authorized') throw new Error('Server said unathorized, but we are authorized');

      navigate([routes.game, res.data.id].join('/'));
    },
  });

  return (
    <PageMain>
      <Stack direction="column" justifyContent="center" gap={4}>
        <Paper sx={{ padding: 4, flexBasis: 500 }} variant="outlined">
          <Stack direction="column" gap={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              gap={2}
              sx={(t) => ({
                [t.breakpoints.down('sm')]: {
                  flexDirection: 'column',
                },
              })}
            >
              <Typography variant="h1">Tap the goose!</Typography>

              <Button
                type="button"
                variant="contained"
                onClick={() => {
                  createGameMutation.mutate();
                }}
              >
                Create a new game
              </Button>
            </Stack>
            <Typography variant="h3">Games</Typography>

            {games ? (
              <Stack direction="column" gap={2}>
                <Grid
                  container
                  spacing={2}
                  sx={(t) => ({
                    [t.breakpoints.down('sm')]: {
                      display: 'none',
                    },
                  })}
                >
                  <Grid size={4}>
                    <Typography>ID</Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography>Start at</Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography>End at</Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid size={2}></Grid>
                </Grid>
                {games.map((game) => {
                  return (
                    <Card key={game.id} sx={{ padding: 2 }}>
                      <Grid container spacing={2} columns={{ xs: 4, sm: 12 }}>
                        <Grid size={4}>
                          <Typography
                            sx={(t) => ({
                              [t.breakpoints.up('sm')]: {
                                display: 'none',
                              },
                            })}
                          >
                            ID
                          </Typography>
                          <Typography>{game.id.split('-')[0]}</Typography>
                        </Grid>
                        <Grid size={2}>
                          <Typography
                            sx={(t) => ({
                              [t.breakpoints.up('sm')]: {
                                display: 'none',
                              },
                            })}
                          >
                            Start at
                          </Typography>
                          <Typography>{new Date(game.startAt).toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid size={2}>
                          <Typography
                            sx={(t) => ({
                              [t.breakpoints.up('sm')]: {
                                display: 'none',
                              },
                            })}
                          >
                            End at
                          </Typography>
                          <Typography>{new Date(game.endAt).toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid size={2}>
                          <Typography
                            sx={(t) => ({
                              [t.breakpoints.up('sm')]: {
                                display: 'none',
                              },
                            })}
                          >
                            Status
                          </Typography>
                          <Typography>{game.status}</Typography>
                        </Grid>
                        <Grid size={2}>
                          <Button component={Link} to={[routes.game, game.id].join('/')}>
                            Enter
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <Stack direction="column" justifyContent="center" alignItems="center">
                <CircularProgress />
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </PageMain>
  );
};
