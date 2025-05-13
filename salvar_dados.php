<?php
date_default_timezone_set("America/Sao_Paulo");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["dados"]) || !is_array($data["dados"]) || count($data["dados"]) === 0) {
    echo "Dados inválidos.";
    exit;
}

$arquivoCSV = "dados_transportadoras.csv";
$arquivoAcompanhamento = "acompanhamento.json";

// Agrupamos os campos fixos da primeira linha
$transportadora = $data["dados"][0][0];
$placa = $data["dados"][0][1];
$motorista = $data["dados"][0][2];
$rg = $data["dados"][0][3];
$dataHoraCadastro = date("Y-m-d H:i:s");

// Criamos uma linha no CSV para cada nota, mas repetindo os campos fixos
$fp = fopen($arquivoCSV, "a");

foreach ($data["dados"] as $linha) {
    $linhaComData = array_merge($linha, [$dataHoraCadastro]);
    fputcsv($fp, $linhaComData);
}
fclose($fp);

// Criamos uma única entrada no acompanhamento.json
$dadosNotas = [];

foreach ($data["dados"] as $linha) {
    $nf = $linha[4];
    $po = $linha[5];
    $fornecedor = $linha[6];

    $dadosNotas[] = [
        "nf" => $nf,
        "po" => $po,
        "fornecedor" => $fornecedor,
        "data_hora" => $dataHoraCadastro
    ];
}

// Carrega dados existentes
$acompanhamento = [];
if (file_exists($arquivoAcompanhamento)) {
    $json = file_get_contents($arquivoAcompanhamento);
    $acompanhamento = json_decode($json, true);
}

// Adiciona nova entrada
$acompanhamento[] = [
    "id" => uniqid(),
    "transportadora" => $transportadora,
    "placa" => $placa,
    "motorista" => $motorista,
    "rg" => $rg,
    "status" => "aguardando",
    "hora_chegada" => $dataHoraCadastro,
    "dados" => $dadosNotas
];

file_put_contents($arquivoAcompanhamento, json_encode($acompanhamento, JSON_PRETTY_PRINT));

echo "Dados salvos com sucesso!";
