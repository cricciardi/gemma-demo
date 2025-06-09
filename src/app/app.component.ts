import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {FilesetResolver, LlmInference} from '@mediapipe/tasks-genai';
import {NgClass} from '@angular/common';
import {FormsModule} from '@angular/forms';

interface Message {
  from: 'user' | 'ai';
  text: string | undefined;
}

@Component({
  selector: 'app-root',
  imports: [NgClass, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public title = 'GemmaDemo';
  public genai: any;
  public llmInference: LlmInference | undefined;
  public $currentText: WritableSignal<string | undefined> = signal(undefined);
  public $loading: WritableSignal<boolean> = signal(false);

  public $messages: WritableSignal<Message[]> = signal( [
    {from: 'ai', text: 'Hello! How can I help you?'}
  ]);

  constructor() {
  }

  async ngOnInit() {
    await this.addModelIntoProject();
  }

  public async addModelIntoProject() {
    this.genai = await FilesetResolver.forGenAiTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm"
    );
    this.llmInference = await LlmInference.createFromOptions(this.genai, {
      baseOptions: {
        modelAssetPath: 'gemma2-2b-it-gpu-int8.bin'
      },
      maxTokens: 1000,
      topK: 40,
      temperature: 0.8,
      randomSeed: 101,
    });
  }

  public async send() {
    if (this.$currentText() && this.llmInference) {

      this.addMessageToSignal({from: 'user', text: this.$currentText()})
      this.$loading.set(true);

      const query = this.$currentText() as string;
      this.setCurrentTextSignal(undefined);
      const response = await this.llmInference.generateResponse(query);

      this.$loading.set(false);
      this.addMessageToSignal({from: 'ai', text: response});
    }
  }

  private addMessageToSignal(message: Message) {
    this.$messages.update((old_value) => [...old_value, message]);
  }

  private setCurrentTextSignal(text: string | undefined) {
    this.$currentText.set(text);
  }
}
