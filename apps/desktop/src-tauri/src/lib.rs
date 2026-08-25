use serde::Serialize;

#[derive(Serialize)]
struct ModelState {
    name: &'static str,
    installed: bool,
}

#[tauri::command]
fn model_state() -> Vec<ModelState> {
    vec![
        ModelState { name: "OCR", installed: false },
        ModelState { name: "Detector", installed: false },
        ModelState { name: "VLM reviewer", installed: false },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![model_state])
        .run(tauri::generate_context!())
        .expect("error while running Ortheon desktop application");
}
