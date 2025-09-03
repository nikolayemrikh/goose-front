import { FC } from 'react';

import { Navigate, Outlet, Route, Routes as RouterRoutes } from 'react-router-dom';

import { SignInPage } from '@app/Auth/SignInPage';
import { SignUpPage } from '@app/Auth/SignUpPage';
import { PeerLobby } from '@app/PeerLobby';
import { authClient } from '@app/core/auth';
import { Game } from '@app/pages/Game';
import { GAME_ID_PARAM } from '@app/pages/Game/constants';
import { routes } from './routes';

const DetectRoute: FC = () => {
  const { data: session } = authClient.useSession();

  return session ? <Navigate to={routes.root} /> : <Navigate to={routes.login} />;
};

const AuthRoute: FC = () => {
  const { data: session } = authClient.useSession();
  console.log(session);

  return session ? <Outlet /> : <Navigate to={routes.login} />;
};

const NotAuthenticatedRoute: FC = () => {
  const { data: session } = authClient.useSession();

  return session ? <Navigate to={routes.root} /> : <Outlet />;
};

export const Routes: FC = () => {
  return (
    <RouterRoutes>
      <Route element={<AuthRoute />}>
        <Route path={routes.root} element={<PeerLobby />} />
        <Route path={routes.game + '/:' + GAME_ID_PARAM} element={<Game />} />
      </Route>

      <Route element={<NotAuthenticatedRoute />}>
        <Route path={routes.login} element={<SignInPage />} />
        <Route path={routes.signup} element={<SignUpPage />} />
      </Route>

      <Route path="*" element={<Navigate to={routes.root} />} />
    </RouterRoutes>
  );
};
