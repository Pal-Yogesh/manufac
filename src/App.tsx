import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import MainChart from "./components/MainChart";
import "./index.css";
export default function App() {
  return <MantineProvider theme={theme}>
    <MainChart />
  </MantineProvider>;
}
