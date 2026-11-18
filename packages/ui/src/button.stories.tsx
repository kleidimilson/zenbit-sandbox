import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button.js";
import "./styles.css";

const meta: Meta<typeof Button> = { title: "Componentes/Button", component: Button };
export default meta;

export const Primario: StoryObj<typeof Button> = { args: { children: "Salvar" } };
