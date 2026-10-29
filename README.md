# 🎃 Boo! What's the Song? (Part 2 - Especial de Halloween) 👻

Um jogo interativo de adivinhação musical estilo **Bandle** com tema de Halloween! O jogador ouve a música separada por instrumentos, começando pela Bateria, e precisa adivinhar qual é a canção conforme novos instrumentos são liberados a cada rodada.

---

## 🚀 Como Iniciar o Jogo

Abra o terminal nesta pasta e execute:

```bash
./start.sh
```

*(Ou rode `python3 server.py`)*

O script iniciará um servidor local e abrirá automaticamente seu navegador em:
👉 **`http://localhost:8000/index.html`**

---

## 🎮 Mecânica do Jogo

1. **Seleção de Faixas:** No topo da tela, você pode escolher qualquer música do catálogo (ex: **1. Thriller**, **2. Ghostbusters**).
2. **Rodada 1:** Apenas a **Bateria (Drums)** toca.
3. O jogador pode tentar adivinhar digitando na barra de busca (com sugestões automáticas) ou clicar em **"Pular (+1 Instrumento)"**.
4. **Rodadas Seguintes:** Vão se somando o **Baixo (Bass)**, **Guitarra (Guitar)**, **Sintetizadores (Other)** e por fim os **Vocais (Vocals)**.
5. Ao acertar ou esgotar as tentativas, todos os instrumentos são liberados no **Mixer** e surge o botão para avançar para a **Próxima Música ⏭️**!

---

## 🎵 Como Adicionar Novas Músicas

1. Separe os instrumentos da sua música (bateria, baixo, outros, vocal).
2. Salve os arquivos de áudio dentro da pasta `audio/` seguindo o padrão:
   - `audio/[nome_da_musica]_drums.mp3`
   - `audio/[nome_da_musica]_bass.mp3`
   - `audio/[nome_da_musica]_other.mp3`
   - `audio/[nome_da_musica]_vocals.mp3`
3. Abra o arquivo `songs.json` e adicione os dados da música e novas opções para o autocomplete.

---

## ✂️ Ferramentas Recomendadas para Separação de Stems (Melhores que o BandLab)

- **[MVSEP.com](https://mvsep.com)** *(Online / Grátis)*: Permite usar modelos como **BS-Roformer** ou **Demucs HT**, que oferecem isolamento quase sem vazamentos sonoros.
- **[UVR5 (Ultimate Vocal Remover)](https://github.com/Anjok07/ultimatevocalremovergui)** *(Software Desktop / Grátis)*: A ferramenta mais potente e precisa do mundo open-source para isolar vocais e instrumentos.
- **[Moises.ai](https://moises.ai)** *(Web e Mobile)*: Muito intuitivo e com boa qualidade.

---

## 👥 Equipe do Projeto

Desenvolvido por:
- **Alice**
- **Clara**
- **Giovanni**
- **Joelma**
- **Mateuzinho**

