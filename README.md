
# Szkolny Helpdesk

Aplikacja do zgłaszania usterek w salach (216, 220, 214). Użytkownik dodaje zgłoszenia ze zdjęciem i śledzi ich status, a technik przegląda wszystkie zgłoszenia, filtruje je, zmienia status i dodaje komentarz.


## Screenshots

![App Screenshot]()

![App Screenshot]()

![App Screenshot]()


## Autor

- [@Gabrynio4](https://github.com/Gabrynio4)

## Uruchomienie lokalnie
 
Wymagania: Node.js, npm, Git.
 
```bash
git clone https://github.com/Gabrynio4/helpdesk
cd helpdesk
npm install
```
 

 
Uruchom serwer deweloperski:
 
```bash
npm run dev
```
 
Aplikacja działa pod adresem `http://localhost:3000`.
## Wdrożenie w Coolify
 
Całość działa na jednym VPS i składa się z dwóch usług.
 
| Usługa | Źródło | Port | Domena |
|---|---|---|---|
| **PocketBase** |  szablon usługi w Coolify | 8090 | ### |
| **Aplikacja Next.js** | repozytorium GitHub | 3000 | ### |
 
### Zmienne środowiskowe (aplikacja Next.js)
 
| Zmienna| Opis |
|---|---|
| `NEXT_PUBLIC_POCKETBASE_URL` | Publiczny adres PocketBase |
## Konta testowe
 
Nowe konta można także utworzyć w panelu logowania. Technik to użytkownik z rolą `admin`. Uprawnienia administratora mogą zostać dodane do istniejącego już konta przez innego administratora. Nie da się utworzyć konta z uprawnieniami administracyjnymi na start.
 
| Rola | E-mail | Hasło |
|---|---|---|
| Użytkownik (`user`) | `testuser@abc.com` | `testuser` 
| Technik (`admin`) | `testadmin@abc.com` | `testadmin` 