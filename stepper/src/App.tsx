import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";
import {
    BrowserRouter,
    Switch,
    Route,
    useLocation,
    useHistory,
} from "react-router-dom";
import "./App.css";
import { ModalProvider, useModal } from "./ModalProvider";

type TSetQueryStringOptions = {
    clearAllQueries?: boolean;
};

type TQueryString = {
    form?: string;
    modal?: string;
    tab?: string;
    paymentMethodId?: string;
    advertId?: string;
};
function useQueryStringRoot() {
    // const location = useLocation();
    const [params, setParams] = useState(
        () => new URLSearchParams(window.location.search)
    );
    const history = useHistory();
    const stack = useRef<[string, string][]>([]);

    useEffect(() => {
        const newParams = new URLSearchParams(window.location.search);
        history.replace({
            pathname: location.pathname,
            search: newParams.toString(),
        });
        setParams(newParams);
        // this effect should only run when the query string is updated by some other component
    }, [window.location.search]);

    function setQueryString<T extends keyof TQueryString>(
        key: T,
        value: TQueryString[T],
        options?: TSetQueryStringOptions
    ) {
        console.log(key, value, options);
        const newParams = options?.clearAllQueries
            ? new URLSearchParams([[key, value]])
            : new URLSearchParams([
                  ...[...params.entries()].filter((param) => param[0] !== key),
                  [key, value],
              ]);
        history.replace({
            pathname: window.location.pathname,
            search: newParams.toString(),
        });
        setParams(newParams);
        if (stack.current.length >= 5) stack.current.pop();
        stack.current.push([window.location.pathname, newParams.toString()]);
        console.log(newParams, newParams.toString());
    }

    return {
        setQueryString,
        queryString: params,
    };
}

function Home() {
    return <h1>Home</h1>;
}

function PaymentMethods() {
    const { setQueryString, queryString } = useQueryString();
    const { show } = useModal();

    useEffect(() => {
        console.log(
            "paymentmethods page: ",
            queryString.get("form"),
            queryString
        );
    }, [queryString]);

    return (
        <div>
            <h2>Payment methods</h2>
            <div>
                {!queryString.get("form") && (
                    <h3>
                        Payment methods list{" "}
                        <button
                            onClick={() =>
                                setQueryString("form", "addPaymentMethod")
                            }
                        >
                            Add PM
                        </button>
                    </h3>
                )}
                {queryString.get("form") === "addPaymentMethod" && (
                    <>
                        <h3>Add payment method</h3>
                        <button
                            onClick={() => {
                                setQueryString("paymentMethodId", "123");
                                show("CancelAddPaymentMethodModal");
                            }}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

const QueryStringContext = createContext(null);
export const useQueryString = () => {
    const context = useContext(QueryStringContext);
    const rootContext = useQueryStringRoot();
    if (!context) return rootContext;
    return rootContext;
};

function QueryStringProvider({ children }: PropsWithChildren) {
    // const location = useLocation();
    const [params, setParams] = useState(
        () => new URLSearchParams(window.location.search)
    );
    const history = useHistory();
    const stack = useRef<[string, string][]>([]);

    function setQueryString<T extends keyof TQueryString>(
        key: T,
        value: TQueryString[T],
        options?: TSetQueryStringOptions
    ) {
        console.log(key, value, options);
        const newParams = options?.clearAllQueries
            ? new URLSearchParams([[key, value]])
            : new URLSearchParams([
                  ...[...params.entries()].filter((param) => param[0] !== key),
                  [key, value],
              ]);
        history.replace({
            pathname: location.pathname,
            search: newParams.toString(),
        });
        flushSync(() => setParams(newParams));
        if (stack.current.length >= 5) stack.current.pop();
        stack.current.push([window.location.pathname, newParams.toString()]);
        console.log(newParams, newParams.toString());
    }

    function goBack(index?: number) {
        if (index) {
            stack.current = stack.current.slice(0, index + 1);
            const currentRoute = stack.current[stack.current.length - 1];
            const newParams = new URLSearchParams(currentRoute[1]);
            history.replace({
                pathname: currentRoute[0],
                search: currentRoute[1],
            });
            setParams(newParams);
        } else {
            const currentRoute = stack.current.pop();
            const newParams = new URLSearchParams(currentRoute[1]);
            history.replace({
                pathname: currentRoute[0],
                search: currentRoute[1],
            });
            setParams(newParams);
        }
    }

    function removeQueryString<T extends keyof TQueryString>(key: T) {
        const newParams = new URLSearchParams(
            [...params.entries()].filter((param) => param[0] !== key)
        );
        history.replace({
            pathname: window.location.pathname,
            search: newParams.toString(),
        });
        setParams(newParams);
    }

    function replaceQueryString(path: string) {
        history.replace({
            pathname: window.location.pathname,
            search: path,
        });
    }

    const value = {
        setQueryString,
        queryString: params,
        removeQueryString,
        replaceQueryString,
        goBack,
    };

    return (
        <QueryStringContext.Provider value={value}>
            {children}
        </QueryStringContext.Provider>
    );
}

function MyProfile() {
    const { setQueryString, queryString } = useQueryString();

    useEffect(() => {
        console.log("myprofile page: rerendered");
    }, [queryString]);

    return (
        <div>
            <h1>My Profile</h1>
            <div>
                <button
                    onClick={() =>
                        setQueryString("tab", "paymentMethods", {
                            clearAllQueries: true,
                        })
                    }
                >
                    Go to payment methods
                </button>
                {queryString.get("tab") === "paymentMethods" && (
                    <PaymentMethods />
                )}
            </div>
        </div>
    );
}

const MyProfileWithQueryString = () => {
    return (
        // <QueryStringProvider>
        <MyProfile />
        // </QueryStringProvider>
    );
};

function App() {
    return (
        <BrowserRouter>
            <ModalProvider>
                <Switch>
                    <Route
                        path="/my-profile"
                        component={MyProfileWithQueryString}
                        exact
                    />
                    <Route path="/" component={Home} />
                </Switch>
            </ModalProvider>
        </BrowserRouter>
    );
}

export default App;
