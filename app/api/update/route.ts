import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { event, payload } = body;

    console.log("WAHA Event:", event);
    console.log("Payload:", payload);

    if (event === "message.ack") {
      const messageId = payload.id;
      const participant = payload.participant;
      const status = payload.ackName;

      console.log("Message ID:", messageId);
      console.log("Participant:", participant);
      console.log("Status:", status);

      // Example: store in database
      // await supabase.from("message_acks").insert({
      //   message_id: messageId,
      //   participant: participant,
      //   status: status
      // });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}