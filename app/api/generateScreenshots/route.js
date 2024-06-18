import captureScreenshots from "@/app/server/captureScreenshots.mjs";

export const POST = async () => {
    try{
        await captureScreenshots("new");
        return new Response (JSON.stringify("new screenshots generated"), {status: 201})
    } catch (err) {
        return new Response(JSON.stringify(error), { status: 500 })
    }
}