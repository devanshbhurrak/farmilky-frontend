import { cartApi } from "../features/api/cartApi";
import { passbookApi } from "../features/api/passbookApi";
import { orderApi } from "../features/api/orderApi";
import { subscriptionApi } from "../features/api/subscriptionApi";

export const resetUserScopedApiState = (dispatch) => {
  dispatch(cartApi.util.resetApiState());
  dispatch(orderApi.util.resetApiState());
  dispatch(subscriptionApi.util.resetApiState());
  dispatch(passbookApi.util.resetApiState());
};
