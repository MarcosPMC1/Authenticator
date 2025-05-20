
# Módulo de Autenticação

Este projeto de API, integra um inteligente sistema de autenticação para seus projetos, com apenas variaveis de ambiente configure uma imagem Docker capaz de autenticar e gerenciar usuários, além de criar e gerenciar Tenants.
## Funcionalidades

- Autenticação
- Cadastro
- Criação de Tenant

## Técnologia de chaves assimétricas
Um par de chaves assimétricas é utilizado para autenticação dos usuários ao utilizar este sistema, sendo assim a chave pública pode ser compartilhada com outros serviços com a finalidade de validar a autenticidade daquele token.

Então um token JWT é assinado com uma chave privada e é validado por um chave pública.

## Tenants
Pensando em utilizar este projeto para genrenciar usuários e sua aplicação este módulo permite que seja feito a criação de um Tenant e que seja autorizado a utilização pelo usuário.

Tenant nada mais do que se trata da técnica de separar os ambientes para cada cliente, se o sistem será utilizado em uma rede que contenha 5 lojas, cada loja terá um banco de dados com suas informações, desta maneira os usuários da loja 1 não terão acesso ao da loja 2.

## Requisitos

- Banco de dados PostgreSQL
- Docker

## Instalação

Instale este modulo de autenticação com o seguinte link da imagem

```bash
  docker pull ghcr.io/marcospmc1/authenticator:latest
```
    
## Executar o projeto

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

