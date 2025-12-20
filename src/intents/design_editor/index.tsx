import { prepareDesignEditor } from "@canva/intents/design";
import { designEditor } from "./app";
import { registerSmartSchedulerIntent } from "../smart_scheduler";

export const registerCanvaIntents = () => {
    prepareDesignEditor(designEditor);
    registerSmartSchedulerIntent();
};
