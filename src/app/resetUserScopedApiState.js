import { cartApi } from "../features/api/cartApi";
import { invoiceApi } from "../features/api/invoiceApi";
import { orderApi } from "../features/api/orderApi";
import { subscriptionApi } from "../features/api/subscriptionApi";

export const resetUserScopedApiState = (dispatch) => {
  dispatch(cartApi.util.resetApiState());
  dispatch(orderApi.util.resetApiState());
  dispatch(subscriptionApi.util.resetApiState());
  dispatch(invoiceApi.util.resetApiState());
};
