🚀 AI Timesheet Assistant

Inteligentny asystent do zarządzania czasem pracy, który wykorzystuje potęgę Google Gemini AI do analizy i automatyzacji wpisów w grafiku. Projekt jest w pełni skonteneryzowany przy użyciu Dockera, co zapewnia identyczne środowisko działania na każdym komputerze.
🛠 Technologie

    Frontend: React + Vite

    Backend: Node.js + Express + TypeScript

    Baza danych: MySQL 8.0

    ORM: Prisma 6.4.1 (Stable)

    AI: Google Gemini API

    Infrastruktura: Docker & Docker Compose

📋 Wymagania wstępne

Przed uruchomieniem upewnij się, że masz zainstalowane:

    Docker Desktop

    Klucz API do Google Gemini (możesz go wygenerować w Google AI Studio)

⚡ Szybki start

1. Przygotowanie zmiennych środowiskowych

W głównym folderze projektu utwórz plik .env (możesz skopiować zawartość z .env.example) i uzupełnij swój klucz AI:
Fragment kodu

DATABASE_URL="mysql://root:root_password@db:3306/timesheet_db"
GEMINI_API_KEY=TWÓJ_KLUCZ_GEMINI_TUTAJ

2. Uruchomienie kontenerów

Otwórz terminal w głównym folderze i wpisz:
PowerShell

docker compose up -d --build

Ta komenda pobierze obrazy, skonfiguruje sieć i uruchomi Frontend, Backend oraz Bazę Danych w tle.

3. Inicjalizacja bazy danych

Ponieważ baza danych w Dockerze jest nowa, musisz jednorazowo "wypchnąć" do niej schemat tabel:
PowerShell

docker exec -it ai-timesheet-assistant-backend-1 npx prisma db push

🌐 Adresy aplikacji

    Frontend: http://localhost:5173

    Backend API: http://localhost:5000

💡 Rozwiązywanie problemów

    Błąd portu 3306: Jeśli Docker nie chce wystartować bazy, upewnij się, że Twój lokalny serwer MySQL (zainstalowany bezpośrednio na Windowsie) jest wyłączony.

    Błąd tabel w Prisma: Jeśli aplikacja zgłasza brak tabel, upewnij się, że wykonałeś krok z npx prisma db push wewnątrz kontenera backendu.

    Note: Projekt został zoptymalizowany pod kątem stabilności na wersji Prisma 6.4.1, aby uniknąć problemów z konfiguracją Driver Adapters w środowisku Dockerowym.