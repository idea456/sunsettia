import React, { useMemo } from "react";
import { useQueryString } from "./App";
import { useModal } from "./ModalProvider";
import { useLocation } from "react-router-dom";

const CancelAddPaymentMethodModal = ({ title = "title" }) => {
    const { hide } = useModal();
    const queryString = new URLSearchParams(window.location.search);

    const id = queryString.get("paymentMethodId");

    return (
        <div
            style={{
                width: "40vw",
                height: "30vh",
                background: "white",
                position: "absolute",
                top: 0,
            }}
        >
            <h1 style={{ color: "black", zIndex: 9999 }}>
                {title} {id}
            </h1>
            <button onClick={() => hide()}>Back</button>
            <button
                onClick={() => {
                    // replaceQueryString("tab=paymentMethods");
                }}
            >
                Yes
            </button>
        </div>
    );
};

export default CancelAddPaymentMethodModal;
