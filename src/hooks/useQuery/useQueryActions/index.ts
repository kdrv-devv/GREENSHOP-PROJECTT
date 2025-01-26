import { useMutation } from "react-query";
import { useAxios } from "../../useAxios";
import { useDispatch } from "react-redux";
import { notificationApi } from "../../../generic/notification";
import { signInWithGoogle } from "../../../config";
import { useReduxDispatch } from "../../useRedux";
import { AuthUser, CouponType } from "../../../@types";
import { setCoupon, setIsLoading } from "../../../redux/coupon-slice";
import { useSignIn } from "react-auth-kit";
import { setAuthorizationModalVisibility } from "../../../redux/modal-slice";

const useLogin = () => {
  const dispatch = useDispatch();
  const axios = useAxios();
  const notify = notificationApi();
  const sigIn = useSignIn();
  return useMutation({
    mutationFn: ({ data }: { data: object }) =>
      axios({ url: "/user/sign-in", body: data, method: "POST" }),
    onSuccess: (data: { token: string; user: AuthUser }): void => {
      const { token, user } = data;
      sigIn({
        token,
        tokenType: "Bearer",
        expiresIn: 3600,
        authState: user,
      });
      dispatch(
        setAuthorizationModalVisibility({ open: false, isLoading: false })
      );
      localStorage.setItem("token", token);

      notify("login");
    },
    onError: (error: { status: number }) => {
      if (error.status === 409) notify(409);
      dispatch(
        setAuthorizationModalVisibility({ open: true, isLoading: false })
      );
    },
  });
};
const loginWithGoogle = () => {
  const axios = useAxios();
  const dispatch = useDispatch();
  const notify = notificationApi();

  return useMutation({
    mutationFn: async () => {
      const response = await signInWithGoogle();
      return await axios({
        url: "/user/sign-in/google",
        method: "POST",
        body: { email: response.user.email },
      });
    },
    onSuccess: ({ data }: { data: { token: string; user: AuthUser } }) => {
      dispatch(
        setAuthorizationModalVisibility({ open: false, isLoading: false })
      );
      const { token } = data;
      localStorage.setItem("token", token);
      notify("login");
    },
    onError: (error: { status: number }) => {
      if (error.status === 409) notify(409);
      dispatch(
        setAuthorizationModalVisibility({ open: true, isLoading: false })
      );
    },
  });
};

const useRegister = () => {
  const axios = useAxios();
  const dispatch = useReduxDispatch();
  const notify = notificationApi();
  return useMutation({
    mutationFn: ({ data }: { data: object }) =>
      axios({ url: "/user/sign-up", method: "POST", body: data }),
    onSuccess: ({ data }: { data: { token: string; user: AuthUser } }) => {
      console.log(data);
      dispatch(
        setAuthorizationModalVisibility({ open: false, isLoading: false })
      );
      notify("register");
    },
    onError: (error: { status: number }) => {
      if (error.status === 406) notify(406);
      dispatch(
        setAuthorizationModalVisibility({ open: true, isLoading: false })
      );
    },
  });
};

const useRegisterWithGoogle = () => {
  const axios = useAxios();
  const notify = notificationApi();
  const dispatch = useReduxDispatch();
  return useMutation({
    mutationFn: async () => {
      const response = await signInWithGoogle();
      return axios({
        url: "/user/sign-up/google",
        method: "POST",
        body: { email: response.user.email },
      });
    },
    onSuccess: ({ data }: { data: { token: string; user: AuthUser } }) => {
      const { token } = data;
      localStorage.setItem("token", token);
      notify("register");
      dispatch(
        setAuthorizationModalVisibility({ open: false, isLoading: false })
      );
    },
    onError: (error) => {
      setAuthorizationModalVisibility({ open: true, isLoading: false });
      notify(406);
      console.log(error);
    },
  });
};

const useGetCoupon = () => {
  const axios = useAxios();
  const notify = notificationApi();
  const dispatch = useReduxDispatch();
  return useMutation({
    mutationFn: (data: object) => {
      dispatch(setIsLoading(true));
      return axios({
        url: "/features/coupon",
        params: data,
      });
    },
    onSuccess: (data: CouponType) => {
      notify("succses_coupon");
      dispatch(setIsLoading(false));
      dispatch(setCoupon(data.discount_for));
    },
    onError: () => {
      notify("coupon_404");
      dispatch(setIsLoading(false));
    },
  });
};

export {
  useLogin,
  loginWithGoogle,
  useRegister,
  useRegisterWithGoogle,
  useGetCoupon,
};
