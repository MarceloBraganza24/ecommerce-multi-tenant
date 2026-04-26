type SendWhatsAppTextArgs = {
  to: string;
  message: string;
};

type TemplateParameter = {
  type: "text";
  text: string;
};

type SendWhatsAppTemplateArgs = {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParameters?: TemplateParameter[];
  buttonUrlParameter?: string;
};

function getWhatsAppConfig() {
  return {
    token: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  };
}

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

async function sendWhatsApp(payload: Record<string, unknown>) {
  const { token, phoneNumberId } = getWhatsAppConfig();

  if (!token || !phoneNumberId) {
    console.log("WhatsApp omitido:", payload);
    return;
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error("WhatsApp error:", error);
  }
}

export async function sendWhatsAppText({ to, message }: SendWhatsAppTextArgs) {
  const cleanTo = cleanPhone(to);
  if (!cleanTo) return;

  await sendWhatsApp({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanTo,
    type: "text",
    text: {
      preview_url: true,
      body: message,
    },
  });
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "es_AR",
  bodyParameters = [],
  buttonUrlParameter,
}: SendWhatsAppTemplateArgs) {
  const cleanTo = cleanPhone(to);
  if (!cleanTo) return;

  const components: Record<string, unknown>[] = [];

  if (bodyParameters.length > 0) {
    components.push({
      type: "body",
      parameters: bodyParameters,
    });
  }

  if (buttonUrlParameter) {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [
        {
          type: "text",
          text: buttonUrlParameter,
        },
      ],
    });
  }

  await sendWhatsApp({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanTo,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components,
    },
  });
}