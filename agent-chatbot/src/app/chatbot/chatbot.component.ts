import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const dialogFlowURL =
  'http://127.0.0.1:5001/agent-neo-dent/us-central1/dialogFlowGateway';

interface Message {
  text: string;
  sender: string;
  date: Date;
  reply?: boolean;
  avatar?: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit {
  messages: Message[] = [];
  loading = false;

  // Random ID to maintain session with server
  sessionId = Math.random().toString(36).slice(-5);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.addBotMessage(
      'Hola, seré su asistente 🤖. ¿Cómo puedo ayudarlo a actualizar su cuenta?'
    );
  }

  handleUserMessage({ message }: { message: string; files: File[] }) {
    this.addUserMessage(message);

    this.loading = true;

    this.http
      .post<any>(dialogFlowURL, {
        sessionId: this.sessionId,
        queryInput: {
          text: {
            text: message,
            languageCode: 'es-MX',
          },
        },
      })
      .subscribe((rep: { fulfillmentText: string }) => {
        this.addBotMessage(rep.fulfillmentText);
        this.loading = false;
      });
  }

  addUserMessage(text: string) {
    this.messages.push({
      text,
      sender: 'Paciente',
      reply: true,
      date: new Date(),
    });
  }

  addBotMessage(text: string) {
    this.messages.push({
      text,
      sender: 'Bot',
      avatar: '/assets/bot.jpeg',
      date: new Date(),
    });
  }
}
