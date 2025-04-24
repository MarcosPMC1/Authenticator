
# Módulo de Autenticação

Este projeto de API, integra um inteligente sistema de autenticação para seus projetos, com apenas variaveis de ambiente configure uma imagem Docker capaz de autenticar e gerenciar usuários
## Funcionalidades

- Autenticação
- Cadastro


## Instalação

Instale este modulo de autenticação com o seguinte link da imagem

```bash
  docker pull ghcr.io/marcospmc1/authenticator:latest
```
    
## Utilizar o projeto

Clone o projeto

```bash
  git clone https://github.com/MarcosPMC1/Authenticator.git
```

Entre no diretório do projeto

```bash
  cd Authenticator
```

Gerar chaves assimétricas

```bash
    openssl genpkey -algorithm RSA -out key -pkeyopt rsa_keygen_bits:2048
    openssl rsa -pubout -in key -out key.pub
```

Inicie o servidor com o .env criado

```bash
    sudo docker compose up
```


## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env

`POSTGRES_HOST`

`POSTGRES_DATABASE`

`POSTGRES_USER`

`POSTGRES_PASSWORD`


## Feedback

Se você tiver algum feedback, por favor nos deixe saber por meio de marcospmc@gmail.com

