<?php
$dados = json_decode(file_get_contents("php://input"), true);

if (!isset($dados["id"]) || !isset($dados["status"])) {
    echo "Dados inválidos.";
    exit;
}

$arquivo = "acompanhamento.json";
if (!file_exists($arquivo)) {
    echo "Arquivo não encontrado.";
    exit;
}

$acompanhamento = json_decode(file_get_contents($arquivo), true);
$encontrado = false;

foreach ($acompanhamento as &$registro) {
    if (isset($registro["id"]) && $registro["id"] === $dados["id"]) {
        $registro["status"] = $dados["status"];
        $encontrado = true;
        break;
    }
}

if ($encontrado) {
    file_put_contents($arquivo, json_encode($acompanhamento, JSON_PRETTY_PRINT));
    echo "Status atualizado.";
} else {
    echo "Registro não encontrado.";
}
