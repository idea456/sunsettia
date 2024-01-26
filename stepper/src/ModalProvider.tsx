import React, {
    PropsWithChildren,
    Suspense,
    createContext,
    useMemo,
    useState,
    useContext,
} from "react";
import { createPortal } from "react-dom";
import modals from "./modals";

const ModalContext = createContext(null);
export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error("useModal must be used under ModalContext!");
    return context;
};

export const ModalProvider = ({ children }: PropsWithChildren) => {
    const [currentModalId, setCurrentModalId] = useState("");

    const RenderedModal = useMemo(
        () => modals[currentModalId],
        [currentModalId]
    );

    const show = (key: string) => {
        setCurrentModalId(key);
    };
    const hide = () => setCurrentModalId("");

    const value = {
        show,
        hide,
    };

    return (
        <ModalContext.Provider value={value}>
            {RenderedModal &&
                createPortal(
                    <Suspense>
                        <RenderedModal />
                    </Suspense>,
                    document.body
                )}
            {children}
        </ModalContext.Provider>
    );
};
