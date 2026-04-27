import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import ChildProfiles from "./pages/ChildProfiles";
import MedicationLog from "./pages/MedicationLog";
import TemperatureLog from "./pages/TemperatureLog";
import FluidsOutput from "./pages/FluidsOutput";
import SymptomTracker from "./pages/SymptomTracker";
import FeverBasics from "./pages/FeverBasics";
import RedFlags from "./pages/RedFlags";
import FAQ from "./pages/FAQ";
import Account from "./pages/Account";
import PaymentSuccess from "./pages/PaymentSuccess";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/dashboard">
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/children">
        <AppLayout><ChildProfiles /></AppLayout>
      </Route>
      <Route path="/medications">
        <AppLayout><MedicationLog /></AppLayout>
      </Route>
      <Route path="/temperature">
        <AppLayout><TemperatureLog /></AppLayout>
      </Route>
      <Route path="/fluids">
        <AppLayout><FluidsOutput /></AppLayout>
      </Route>
      <Route path="/symptoms">
        <AppLayout><SymptomTracker /></AppLayout>
      </Route>
      <Route path="/fever-basics">
        <AppLayout><FeverBasics /></AppLayout>
      </Route>
      <Route path="/red-flags">
        <AppLayout><RedFlags /></AppLayout>
      </Route>
      <Route path="/faq">
        <AppLayout><FAQ /></AppLayout>
      </Route>
      <Route path="/account">
        <AppLayout><Account /></AppLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
