import vonage

client = vonage.Client(key="845832bb", secret="JPRcfKt7f2JrwPm8")
sms = vonage.Sms(client)

response = sms.send_message({
    "from": "PITIK PROJECT"
    "to": "639613886156",  # ✅ must start with country code (no plus)
    "text": "Test SMS from Vonage Python SDK v3",
})

if response["messages"][0]["status"] == "0":
    print("Message sent successfully.")
else:
    print(f"Message failed: {response['messages'][0]['error-text']}")
