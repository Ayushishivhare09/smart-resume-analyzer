import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/lib/toast";
import Landing from "./pages/Landing";
import Analyze from "./pages/Analyze";
import Tracker from "./pages/Tracker";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />}/>
            <Route path="/analyze" element={<Analyze />}/>
            <Route path="/tracker" element={<Tracker />}/>
            <Route path="/history" element={<History />}/>
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  </QueryClientProvider>);
export default App;
