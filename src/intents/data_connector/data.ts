import { GetDataTableRequest } from "@canva/intents/data";

export async function getRealEstateData(request: GetDataTableRequest) {
    return {
        columns: [
            { name: "Project", type: "string" },
            { name: "Stage", type: "string" },
            { name: "Sales", type: "number" }
        ],
        rows: [
            ["Project A", "Stage 1", 1500000],
            ["Project B", "Stage 2", 2300000],
            ["Project C", "Discovery", 500000]
        ]
    };
}
