import { FC, ReactNode, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";

interface IProps {
  children: ReactNode;
}

const WithAuthGuard = ({ children }: IProps) => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    console.log("authguard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  return <>{children}</>;
};

const withAuthGuard =
  (Component: FC) =>
  ({ ...props }) =>
    (
      <WithAuthGuard>
        <Component {...props} />
      </WithAuthGuard>
    );

export default withAuthGuard;
