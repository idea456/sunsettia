import React, { lazy } from "react";

const modals = {
    CancelAddPaymentMethodModal: lazy(
        () => import("./CancelAddPaymentMethodModal")
    ),
};

export default modals;
