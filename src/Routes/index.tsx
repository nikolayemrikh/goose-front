import { FC } from 'react';

import { Navigate, Outlet, Route, Routes as RouterRoutes } from 'react-router-dom';

import { authClient } from '@app/core/auth';
import { SignInPage } from '@app/pages/Auth/SignInPage';
import { SignUpPage } from '@app/pages/Auth/SignUpPage';
import { Game } from '@app/pages/Game';
import { GAME_ID_PARAM } from '@app/pages/Game/constants';
import { Root } from '@app/pages/Root';
import { routes } from './routes';

const DetectRoute: FC = () => {
  const { data: session } = authClient.useSession();

  return session ? <Navigate to={routes.root} /> : <Navigate to={routes.login} />;
};

const AuthRoute: FC = () => {
  const { data: session } = authClient.useSession();

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
        <Route path={routes.root} element={<Root />} />
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
