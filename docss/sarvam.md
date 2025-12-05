---
title: Speech-to-Text Rest API
description: >-
  Process short audio files synchronously with immediate response. Instant
  transcription and translation for quick audio processing with multiple format
  support.
icon: bolt
canonical-url: 'https://docs.sarvam.ai/api-reference-docs/speech-to-text/apis/rest-api'
'og:title': Speech-to-Text REST API - Instant Audio Transcription by Sarvam AI
'og:description': >-
  Process short audio files synchronously with Sarvam AI's REST API. Instant
  transcription results with simple integration and multiple audio format
  support.
'og:type': article
'og:site_name': Sarvam AI Developer Documentation
'og:image':
  type: url
  value: >-
    https://res.cloudinary.com/dvcb20x9a/image/upload/v1743510800/image_3_rpnrug.png
'og:image:width': 1200
'og:image:height': 630
'twitter:card': summary_large_image
'twitter:title': Speech-to-Text REST API - Instant Audio Transcription by Sarvam AI
'twitter:description': >-
  Process short audio files synchronously with Sarvam AI's REST API. Instant
  transcription results with simple integration and multiple audio format
  support.
'twitter:image':
  type: url
  value: >-
    https://res.cloudinary.com/dvcb20x9a/image/upload/v1743510800/image_3_rpnrug.png
'twitter:site': '@SarvamAI'
---

<h3>Synchronous Processing</h3>
<p>
  Process short audio files with immediate response. Best for quick
  transcriptions and testing with a maximum duration of 30 seconds.
</p>


## Saarika: Speech to Text Transcription Model

Saarika is a speech-to-text transcription model that excels in handling multi-speaker content, mixed language content, and conference recordings. It offers automatic code-mixing and enhanced multilingual support, making it ideal for a wide range of applications.


<Note>
  **Automatic Language Detection:** Set `language_code` to `"unknown"` to enable automatic language detection. The API will identify the spoken language and return the transcript along with the detected language code.
</Note>

<Note>
  The `input_audio_codec` is an optional parameter. Our API automatically detects all codec formats, so you don't necessarily need to pass this parameter. However, for PCM files specifically (pcm_s16le, pcm_l16, pcm_raw), you must pass this parameter. Note that PCM files are supported only at 16kHz sample rate.
</Note>
## Code Examples for Speech to Text Transcription
<Tabs>
  <Tab title="Python">
    ```python
    from sarvamai import SarvamAI

    client = SarvamAI(
        api_subscription_key="YOUR_SARVAM_API_KEY",
    )

    response = client.speech_to_text.transcribe(
        file=open("audio.wav", "rb"),
        model="saarika:v2.5",
        language_code="gu-IN"  # Or use "unknown" for automatic language detection
    )

    print(response)
    ```
  </Tab>
  <Tab title="JavaScript">
    ```javascript
    import {SarvamAIClient} from "sarvamai";
    import fs from 'fs';

    const client = new SarvamAIClient({
        apiSubscriptionKey: "YOUR_SARVAM_API_KEY"
    });

    // Read your audio file
    const audioFile = fs.createReadStream("recording.wav");

    const response = await client.speechToText.transcribe({
        file: audioFile,
        language_code: "en-IN",  // Or use "unknown" for automatic language detection
        model: "saarika:v2.5"
    });

    console.log(response);
    ```
  </Tab>
  <Tab title="cURL">
    ```bash
    curl -X POST https://api.sarvam.ai/speech-to-text \
      -H "api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>" \
      -H "Content-Type: multipart/form-data" \
      -F model="saarika:v2.5" \
      -F language_code="en-IN" \
      -F file=@"file.wav;type=audio/wav"
    
    # Or use language_code="unknown" for automatic language detection
    ```
  </Tab>
</Tabs>
<Note>
  Check out our detailed [API Reference](/api-reference-docs/speech-to-text/transcribe) 
  to explore Speech To Text Transcription and all available options.
</Note>

## Saaras Model: SOTA Speech to Text Translation Model

Saaras is a domain-aware translation model with enhanced telephony support and intelligent entity preservation. It is designed to handle complex language variations and domain-specific content, making it ideal for call center and telephony applications.


<Note>
  The `input_audio_codec` is an optional parameter. Our API automatically detects all codec formats, so you don't necessarily need to pass this parameter. However, for PCM files specifically (pcm_s16le, pcm_l16, pcm_raw), you must pass this parameter. Note that PCM files are supported only at 16kHz sample rate.
</Note>

## Code Examples for Speech to Text Translation
<Tabs>
  <Tab title="Python">
    ```python
    from sarvamai import SarvamAI

    client = SarvamAI(
        api_subscription_key="YOUR_API_SUBSCRIPTION_KEY",
    )

    response = client.speech_to_text.translate(
        file=open("audio.wav", "rb"),
        model="saaras:v2.5"
    )

    print(response)
    ```
  </Tab>
  <Tab title="JavaScript">
    ```javascript
    import {SarvamAIClient} from "sarvamai";
    import fs from 'fs';

    const client = new SarvamAIClient({
        apiSubscriptionKey: "YOUR_SARVAM_API_KEY"
    });

    // Read your audio file
    const audioFile = fs.createReadStream("recording.wav");

    const response = await client.speechToText.translate({
        file: audioFile,
        model: "saaras:v2.5"
    });

    console.log(response);
    ```
  </Tab>
  <Tab title="cURL">
    ```bash
    curl -X POST https://api.sarvam.ai/speech-to-text-translate \
      -H "api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>" \
      -H "Content-Type: multipart/form-data" \
      -F file=@<file1>
    ```
  </Tab>
</Tabs>
<Note>
  Check out our detailed [API Reference](/api-reference-docs/speech-to-text-translate/translate) 
  to explore Speech To Text Translation and all available options.
</Note>

## API Response Format

### Speech to Text Response

<Tabs>
  <Tab title="Response Schema">
    <ParamField body="request_id" type="string">
      Unique identifier for the request
    </ParamField>

    <ParamField body="transcript" type="string" required>
      The transcribed text from the provided audio file
      
      **Example:** `"नमस्ते, आप कैसे हैं?"`
    </ParamField>

    <ParamField body="language_code" type="string">
      The BCP-47 code of the language spoken in the input. If multiple languages are detected, returns the most predominant language code. Returns null if no language is detected.
      
      **Example:** `"hi-IN"`
    </ParamField>


  </Tab>

  <Tab title="Example Response">
    ```json
    {
      "request_id": "20241115_12345678-1234-5678-1234-567812345678",
      "transcript": "नमस्ते, आप कैसे हैं?",
      "language_code": "hi-IN"
    }
    ```
    
  </Tab>
</Tabs>

### Speech to Text Translate Response

<Tabs>
  <Tab title="Response Schema">
    <ParamField body="request_id" type="string">
      Unique identifier for the request
    </ParamField>

    <ParamField body="transcript" type="string" required>
      Translated transcript of the provided speech in English
    </ParamField>

    <ParamField body="language_code" type="string">
      The BCP-47 code of the language spoken in the input. If multiple languages are detected, returns the most predominant language code.
      
      **Supported Languages:** hi-IN, bn-IN, kn-IN, ml-IN, mr-IN, od-IN, pa-IN, ta-IN, te-IN, gu-IN, en-IN
    </ParamField>
  </Tab>

  <Tab title="Example Response">
    ```json
    {
      "request_id": "20241115_12345678-1234-5678-1234-567812345678",
      "transcript": "Hello, how are you?",
      "language_code": "hi-IN"
    }
    ```
  </Tab>
</Tabs>

## Next Steps

<Steps>
  <Step title="Get API Key">
    Sign up and get your API key from the
    [dashboard](https://dashboard.sarvam.ai).
  </Step>
  <Step title="Test Integration">Try the API with sample audio files.</Step>
  <Step title="Go Live">Deploy your integration and monitor usage.</Step>
</Steps>

<Note>
  Need help? Contact us on [discord](https://discord.com/invite/5rAsykttcs) for
  guidance.
</Note>


---
title: Text-to-Speech Rest API
description: >-
  Real-time conversion of text into speech using customizable voices. Instant
  audio generation with multiple voice options and various audio formats for
  Indian languages.
canonical-url: 'https://docs.sarvam.ai/api-reference-docs/text-to-speech/api/rest-api'
'og:title': Text-to-Speech REST API - Instant Voice Synthesis by Sarvam AI
'og:description': >-
  Convert text to speech instantly with Sarvam AI's REST API. Multiple voice
  options, customizable parameters, and various audio formats for Indian
  languages.
'og:type': article
'og:site_name': Sarvam AI Developer Documentation
'og:image':
  type: url
  value: >-
    https://res.cloudinary.com/dvcb20x9a/image/upload/v1743510800/image_3_rpnrug.png
'og:image:width': 1200
'og:image:height': 630
'twitter:card': summary_large_image
'twitter:title': Text-to-Speech REST API - Instant Voice Synthesis by Sarvam AI
'twitter:description': >-
  Convert text to speech instantly with Sarvam AI's REST API. Multiple voice
  options, customizable parameters, and various audio formats for Indian
  languages.
'twitter:image':
  type: url
  value: >-
    https://res.cloudinary.com/dvcb20x9a/image/upload/v1743510800/image_3_rpnrug.png
'twitter:site': '@SarvamAI'
---
<h3>Synchronous Processing</h3>
Convert text to speech with immediate response. Best for quick conversions and testing.
Features include:
<ul>
    <li>Instant audio generation</li>
    <li>Multiple voice options</li>
    <li>Customizable speech parameters</li>
    <li>Various audio formats</li>
</ul>

## API Features

<CardGroup cols={2}>
  <Card title="Key Features" icon="stars">
    - Multiple speaker voices
    - Adjustable speech parameters
    - High-quality audio output
    - Natural prosody and intonation
  </Card>

{" "}

<Card title="Output Format" icon="file-audio">
  - Multiple audio file formats 
  - Base64 encoded string 
  - Configurable sample rates 
</Card>

{" "}

<Card title="Speech Parameters" icon="sliders">
  - Pitch control 
  - Speech rate adjustment 
  - Language selection
</Card>


</CardGroup>

## Model Information

<CardGroup cols={2}>
  <Card title="Bulbul v2" icon="microphone">
    Our flagship text-to-speech model designed for Indian languages and accents.

    **Key Features:**
    - Natural-sounding speech with human-like prosody
    - Multiple voice personalities
    - Multi-language support
    - Real-time synthesis capabilities
    - Fine-grained control over pitch, pace, and loudness

  </Card>

  <Card title="Language Support" icon="language">
    Supports 11 Indian languages with BCP-47 codes:

    **Supported Languages:**
    - English (en-IN)
    - Hindi (hi-IN)
    - Bengali (bn-IN)
    - Tamil (ta-IN)
    - Telugu (te-IN)
    - Kannada (kn-IN)
    - Malayalam (ml-IN)
    - Marathi (mr-IN)
    - Gujarati (gu-IN)
    - Punjabi (pa-IN)
    - Odia (od-IN)

  </Card>
</CardGroup>

## Bulbul: Our Text to Speech Model

Bulbul is our state-of-the-art text-to-speech model that excels in generating natural-sounding speech with support for multiple Indian languages and various voice options.


## Text to Speech Features

<Tabs>
  <Tab title="Basic Synthesis">
    <div className="mb-8">
      <h3>Basic Text to Speech Synthesis</h3>
      <p>
        Convert text to natural-sounding speech with high quality. Features include:
      </p>
      <ul>
        <li>Multiple voice options</li>
        <li>Support for Indian languages</li>
        <li>Natural prosody and intonation</li>
        <li>High-quality audio output</li>
      </ul>
    </div>
    <Tabs>
      <Tab title="Python">
    ```python
from sarvamai import SarvamAI
from sarvamai.play import save

client = SarvamAI(api_subscription_key="YOUR_API_SUBSCRIPTION_KEY")
# Convert text to speech
audio = client.text_to_speech.convert(
      target_language_code="en-IN",
      text="Welcome to Sarvam AI!",
      model="bulbul:v2",
      speaker="anushka"
  )
save(audio, "output1.wav")
    ```
      </Tab>
      <Tab title="JavaScript">
        ```javascript
        import { SarvamAIClient } from "sarvamai";

        const client = new SarvamAIClient({
          apiSubscriptionKey: "YOUR_API_SUBSCRIPTION_KEY"
        });

        const response = await client.textToSpeech.convert(
          {
            text: "Welcome to Sarvam AI!",
            model: "bulbul:v2",
            speaker: "anushka",
            target_language_code: "en-IN"
          }
        );

        // Handle audio data
        console.log(response.audios);
        ```
      </Tab>
      <Tab title="cURL">
        ```bash
        curl -X POST https://api.sarvam.ai/text-to-speech \
     -H "api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>" \
     -H "Content-Type: application/json" \
     -d '{
"text": "Welcome to Sarvam AI!",
"target_language_code": "en-IN",
"speaker": "anushka",
"model": "bulbul:v2"
}'
        ```
</Tab>
</Tabs>

  </Tab>

  <Tab title="Voice Selection">
    <div className="mb-8">
      <h3>Available Voices</h3>
      <p>
        Choose from a variety of natural-sounding voices for different use cases and languages.
      </p>
      <CardGroup cols={2}>
        <Card title="Female Voices">
          - Anushka: Clear and professional
          - Manisha: Warm and friendly
          - Vidya: Articulate and precise
          - Arya: Young and energetic
        </Card>
        <Card title="Male Voices">
          - Abhilash: Deep and authoritative
          - Karun: Natural and conversational
          - Hitesh: Professional and engaging
        </Card>
      </CardGroup>
    </div>
    <Tabs>
      <Tab title="Python">
```python
import base64
from sarvamai import SarvamAI

client = SarvamAI(api_subscription_key="YOUR_API_SUBSCRIPTION_KEY")

response = client.text_to_speech.convert(
    text="Welcome to Sarvam AI!",
    model="bulbul:v2",
    target_language_code="en-IN",
    speaker="anushka"
)

with open("output.wav", "wb") as f:
    f.write(base64.b64decode("".join(response.audios)))

```
      </Tab>
      <Tab title="JavaScript">
```javascript
import { SarvamAIClient } from "sarvamai";

async function convertTextToSpeech() {
  const client = new SarvamAIClient({
    apiSubscriptionKey: "YOUR_API_SUBSCRIPTION_KEY"
  });

  const response = await client.textToSpeech.convert({
    text: "Hello, how are you?",
    target_language_code: "hi-IN",
    model: "bulbul:v2",
    speaker: "anushka"  
  });

  console.log(response);
}

convertTextToSpeech();



```
</Tab>
<Tab title="cURL">
```bash
# Generate speech with Anushka's voice
curl -X POST https://api.sarvam.ai/text-to-speech \
  -H "api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to Sarvam AI!",
    "target_language_code": "en-IN",
    "speaker": "anushka",
    "model": "bulbul:v2"
}'
```
```bash
# Generate speech with Abhilash's voice
curl -X POST https://api.sarvam.ai/text-to-speech \
  -H "api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to Sarvam AI!",
    "target_language_code": "en-IN",
    "speaker": "abhilash",
    "model": "bulbul:v2"
}'
```
```bash
# Generate speech with Manisha's voice
curl -X POST https://api.sarvam.ai/text-to-speech \
  -H "api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to Sarvam AI!",
    "target_language_code": "en-IN",
    "speaker": "manisha",
    "model": "bulbul:v2"
}'
```
</Tab>
</Tabs>

  </Tab>

  <Tab title="Advanced Options">
    <div className="mb-8">
      <h3>Speech Customization</h3>
      <p>
        Fine-tune the speech output with various parameters:
      </p>
      <ul>
        <li>Adjust speech rate and pitch</li>
        <li>Control volume and emphasis</li>
        <li>Configure audio quality</li>
        <li>Enable text preprocessing</li>
      </ul>
    </div>
    <Tabs>
      <Tab title="Python">
        ```python
        from sarvamai import SarvamAI

        client = SarvamAI(
            api_subscription_key="YOUR_API_SUBSCRIPTION_KEY"
        )

        audio = client.text_to_speech.convert(
            text="Welcome to Sarvam AI!",
            model="bulbul:v2",
            target_language_code="en-IN",
            speaker="anushka",
            pitch=0.2,
            pace=1.2,
            loudness=1.1,
            speech_sample_rate=24000,
            enable_preprocessing=True
        )
        
combined_audio = "".join(audio.audios)
b64_file = base64.b64decode(combined_audio)

with open("output1.wav", "wb") as f:
    f.write(b64_file) 

        ```
      </Tab>
      <Tab title="JavaScript">
        ```javascript
        import { SarvamAIClient } from "sarvamai";

        const client = new SarvamAIClient({
          apiSubscriptionKey: "YOUR_API_SUBSCRIPTION_KEY"
        });

        async function generateCustomizedSpeech() {
          const response = await client.textToSpeech.convert(
            {
              text: "Welcome to Sarvam AI!",
              "model": "bulbul:v2",
              "target_language_code": "en-IN",
              "speaker": "anushka",
              "pitch": 0.2,
              "pace": 1.2,
              "loudness": 1.1,
              "speech_sample_rate": 24000,
              "enable_preprocessing": true
            }
          );

          // Handle the audio data
          console.log(response);
        }

        generateCustomizedSpeech();
        ```
      </Tab>
      <Tab title="cURL">
        ```bash
        curl -X POST https://api.sarvam.ai/text-to-speech \
     -H "api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>" \
     -H "Content-Type: application/json" \
     -d '{
              "text": "Welcome to Sarvam AI!",
              "model": "bulbul:v2",
              "speaker": "anushka",
              "pitch": 0.2,
              "pace": 1.2,
              "loudness": 1.1,
              "target_language_code": "en-IN",
              "speech_sample_rate": 24000,
              "enable_preprocessing": true
}'
        ```
      </Tab>
    </Tabs>

  </Tab>
</Tabs>

<Card title="Key Considerations">
  
  - For numbers > 4 digits, use commas (e.g., '10,000') 
  - Enable preprocessing for better numbers, dates handling
</Card>

## API Response Format

<Tabs>
  <Tab title="Response Schema">
    <ParamField body="request_id" type="string">
      Unique identifier for the request
    </ParamField>

    <ParamField body="audios" type="array" required>
      Array of base64-encoded audio files in the specified format (default: WAV). Each string corresponds to one of the input texts.
      
      **Audio Formats Supported:**
      - WAV (default)
      - MP3
      - Linear16
      - Mulaw
      - Alaw
      - Opus
      - FLAC
      - AAC
      
      **Note:** The audio is encoded as a base64 string. Decode it to save as an audio file.
    </ParamField>
  </Tab>

  <Tab title="Example Response">
    ```json
    {
      "request_id": "20241115_12345678-1234-5678-1234-567812345678",
      "audios": [
        "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQAAAAA..."
      ]
    }
    ```
    
    **Decoding Audio (Python):**
    ```python
    import base64
    
    # Assuming 'response' contains the API response
    audio_base64 = response.audios[0]
    audio_bytes = base64.b64decode(audio_base64)
    
    # Save to file
    with open("output.wav", "wb") as f:
        f.write(audio_bytes)
    ```
    
    **Decoding Audio (JavaScript):**
    ```javascript
    // Assuming 'response' contains the API response
    const audioBase64 = response.audios[0];
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Save to file
    fs.writeFileSync('output.wav', audioBuffer);
    ```
  </Tab>
</Tabs>
