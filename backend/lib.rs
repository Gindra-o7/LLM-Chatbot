use ic_cdk::{update, query, api::time};
use ic_llm::{ChatMessage, Model, Role};
use candid::{CandidType, Deserialize};

// Struktur untuk input prompt dari pengguna
#[derive(CandidType, Deserialize)]
struct EduPrompt {
    subject: String,      // Mata pelajaran (misalnya: "Matematika", "Sains")
    topic: String,        // Topik spesifik (misalnya: "Aljabar", "Fisika Gerak")
    question: String,     // Pertanyaan atau permintaan pengguna
    difficulty: u8,       // Tingkat kesulitan (1-5)
}

// Struktur untuk menyimpan riwayat sesi pengguna (opsional untuk chat)
#[derive(CandidType, Deserialize, Clone)]
struct EduChatMessage {
    role: String,         // "user" atau "assistant"
    content: String,      // Isi pesan
    timestamp: u64,       // Waktu pesan dibuat
}

// Struktur untuk output soal latihan
#[derive(CandidType, Deserialize)]
struct PracticeQuestion {
    question: String,     // Soal latihan
    answer: String,       // Jawaban (opsional, untuk verifikasi)
}

// Fungsi bantu untuk membentuk prompt pendidikan
fn build_edu_prompt(input: EduPrompt) -> String {
    format!(
        "You are an expert educator in {}. Provide a detailed explanation for {} related to '{}'. \
        Adjust the explanation to difficulty level {} (1 = beginner, 5 = advanced). \
        Keep it concise, clear, and educational.",
        input.subject, input.topic, input.question, input.difficulty
    )
}

// Fungsi bantu untuk menghasilkan soal latihan
fn build_practice_prompt(subject: String, topic: String, difficulty: u8) -> String {
    format!(
        "Generate a practice question for {} on the topic '{}'. \
        The question should match difficulty level {} (1 = easy, 5 = very hard). \
        Provide the question and its answer in this format: 'Question: <text> Answer: <text>'.",
        subject, topic, difficulty
    )
}

// Fungsi utama: Menjawab pertanyaan pendidikan
#[update]
async fn ask_edu_question(input: EduPrompt) -> String {
    let prompt = build_edu_prompt(input);
    ic_llm::prompt(Model::Llama3_1_8B, prompt).await
}

// Fungsi utama: Chat interaktif dengan riwayat
#[update]
async fn edu_chat(messages: Vec<EduChatMessage>) -> String {
    let mut chat_history: Vec<ChatMessage> = messages
        .into_iter()
        .map(|msg| ChatMessage {
            role: match msg.role.as_str() {
                "user" => Role::User,
                "system" => Role::System,
                _ => Role::User, // Default ke User jika tidak dikenali
            },
            content: msg.content,
        })
        .collect();

    // Tambahkan instruksi sistem untuk konteks pendidikan
    let system_prompt = ChatMessage {
        role: Role::System,
        content: "You are a helpful educational assistant. Provide clear, concise, and accurate answers.".to_string(),
    };
    chat_history.insert(0, system_prompt);

    ic_llm::chat(Model::Llama3_1_8B, chat_history).await
}

// Fungsi utama: Menghasilkan soal latihan
#[update]
async fn generate_practice_question(subject: String, topic: String, difficulty: u8) -> PracticeQuestion {
    let prompt = build_practice_prompt(subject.clone(), topic.clone(), difficulty);
    let response = ic_llm::prompt(Model::Llama3_1_8B, prompt).await;

    // Parsing sederhana untuk memisahkan soal dan jawaban
    let parts: Vec<&str> = response.split("Answer:").collect();
    if parts.len() == 2 {
        PracticeQuestion {
            question: parts[0].replace("Question:", "").trim().to_string(),
            answer: parts[1].trim().to_string(),
        }
    } else {
        PracticeQuestion {
            question: "Failed to generate a question.".to_string(),
            answer: "N/A".to_string(),
        }
    }
}

// Fungsi tambahan: Mendapatkan waktu saat ini (untuk timestamp)
#[query]
fn get_current_time() -> u64 {
    time()
}

// Ekspor antarmuka Candid
ic_cdk::export_candid!();