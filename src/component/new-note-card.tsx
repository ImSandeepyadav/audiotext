import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteProps {
  onNoteCreated: (content: string) => void;
}

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const speechRecognition = new SpeechRecognitionAPI();

export function NewNoteCard({ onNoteCreated }: NewNoteProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [isRecording, setIsRecording] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [content, setContent] = useState("");

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    const inputValue = event.target.value;
    setContent(inputValue);
  
    if (inputValue === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content === "") {
      return;
    }

    onNoteCreated(content);

    setContent("");
    setShouldShowOnboarding(true);

    toast.success("Note created successfully!");
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  
    if (!isSpeechRecognitionAPIAvailable) {
      alert("Unfortunately your browser does not support the recording API!");
      return;
    }
  
    setIsRecording(true);
    setShouldShowOnboarding(false);
  
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = selectedLanguage;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.interimResults = true;
  
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
  
      setContent(transcript);
    };
  
    recognition.onerror = (event: any) => {
      console.error(event);
    };
  
    recognition.start();
  }
  

  function handleStopRecording() {
    setIsRecording(false);

    if (speechRecognition !== null) {
      speechRecognition.stop();
    }
  }

  function handleLanguageChange(event: any) {
    setSelectedLanguage(event.target.value);
    setContent("");
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col gap-3 text-left bg-[#fb923c] p-5 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-[#020617]">
          Add Note
        </span>

        <p className="text-sm leading-6 text-[#020617]">
          Record an audio note that will be converted to text automatically.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300">
                Add Note
              </span>

              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Start{" "}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="font-medium text-[#fdba74] hover:underline"
                  >
                    recording a note
                  </button>{" "}
                    in audio or if you prefer{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="font-medium text-[#fdba74] hover:underline"
                  >
                    use text only
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  onChange={handleContentChanged}
                  value={content}
                  lang={selectedLanguage}
                />
              )}
              <div className="flex items-center gap-2">
                <label htmlFor="language" className="text-sm font-medium text-slate-300">Select Language:</label>
                <select id="language" className="text-sm text-slate-400 bg-transparent outline-none" value={selectedLanguage} onChange={handleLanguageChange}>
                  <option value="en-US">English (United States)</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>

            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                  Recording! (click to stop)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-[#fdba74] py-4 text-center text-sm text-[#000000] outline-none font-medium hover:bg-[#fdba74]"
              >
                Save Note
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}