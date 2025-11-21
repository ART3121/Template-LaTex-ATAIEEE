# Classes LaTeX para Atas IEEE (PES / IAS / RAS / Geral)

Este projeto contém classes LaTeX desenvolvidas para padronizar a criação das atas de reunião dos capítulos do Ramo Estudantil IEEE–UFJF. Cada sociedade possui uma classe própria com sua identidade visual, garantindo consistência entre documentos.

## Estrutura de Pastas

```
classes/
 ├── PES/
 │    ├── ataPES.cls
 │    └── ata.tex
 ├── IAS/
 │    ├── ataIAS.cls
 │    └── ata.tex
 ├── RAS/
 │    ├── ataRAS.cls
 │    └── ata.tex
 └── IEEE/
      ├── ataIEEE.cls
      └── ata.tex
```

Cada pasta contém a classe `.cls` e um modelo `ata.tex` pronto para uso.

## Como Usar

Escolha a classe desejada e coloque no início do seu arquivo:

```latex
\documentclass{ataPES}
```

ou

```latex
\documentclass{ataIAS}
\documentclass{ataRAS}
\documentclass{ataIEEE}
```

As classes devem estar no mesmo diretório do `.tex` ou acessíveis ao LaTeX.

## Modelo Exemplo de Ata

```latex
\documentclass{ataIAS}

\begin{document}

\cabecalho

\info{data}{Autor}{data}{local}

\begin{membros}
    \membro{1}{Fulano da Silva}{Presidente IAS}
    \membro{2}{Ciclano Souza}{Vice-presidente IAS}
    \membro{3}{Beltrano A. Lima}{Apoio}
\end{membros}

\newpage

\begin{pautas}
    \pauta{Definição de novos projetos da gestão}
    \pauta{Ajuste de calendário}
    \pauta{Discussão sobre voluntariado}
\end{pautas}

\begin{resultados}
    \resultado{Projeto X aprovado, início previsto para dezembro.}
    \resultado{Calendário será fechado até sexta-feira.}
    \resultado{Equipe decide abrir vagas para novos voluntários.}
\end{resultados}
\begin{anexos}
	\anexo{Legenda 1}{imagens/img1.jpeg}
	\anexo{Legenda 2}{imagens/img2.jpeg}
\end{anexos}
\assinaturas

\end{document}

```

## Comandos Principais

### Cabeçalho

```latex
\cabecalho
```

Gera automaticamente o cabeçalho institucional da ata com logos e título.

### Informações Básicas

```latex
\info{data}{Autor}{data}{local}
   
```

Produz uma tabela estilizada com os dados da reunião.

### Títulos de Seção

```latex
\faixatitulo{}
```

Usado para qualquer seção principal da ata.

### Membros Presentes

```latex
\begin{membros}
	\membro{1}{Nome}{Função}
	\membro{2}{Nome}{Função}
\end{membros}
```

Usado para criar a lista de presença estilizada já pronta em forma de tabela com nomes e funções de cada membro.



### Anexos (duas colunas)

```latex
\begin{anexos}
    \anexo{Legenda da imagem}{imgs/img1.jpg}
    \anexo{Outra imagem}{imgs/img2.jpg}
\end{anexos}
```

A classe organiza as imagens automaticamente com legendas e numeração. 

## Conclusão

A ideia desse template é padronizar as atas e oferecer suporte para editar em LaTeX. Os comandos das classes foram feitos para facilitar a edição para membros que não possuem familiaridade com esse tipo de edição de texto.

Apesar do mini tutorial acima, em cada pasta existe já um modelo ata.tex pré-estruturado para cada capítulo visando rápido preenchimento.

Para fazer o upload deste projeto no Overleaf basta comprimir enviar a pasta que contém este arquivo comprimido em .zip para o site.
