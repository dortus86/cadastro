<?php
// Caminho do arquivo CSV
$arquivo = 'dados_transportadoras.csv';

// Obter os dados da requisição (GET)
$notaFiscal = isset($_GET['notaFiscal']) ? trim($_GET['notaFiscal']) : '';
$pedidoPO = isset($_GET['pedidoPO']) ? trim($_GET['pedidoPO']) : '';
$fornecedor = isset($_GET['fornecedor']) ? trim($_GET['fornecedor']) : '';
$dataInicio = isset($_GET['dataInicio']) ? trim($_GET['dataInicio']) : '';
$dataFim = isset($_GET['dataFim']) ? trim($_GET['dataFim']) : '';

// Abrir o arquivo
if (!file_exists($arquivo)) {
    echo json_encode(["erro" => "Arquivo CSV não encontrado."]);
    exit;
}

$fp = fopen($arquivo, 'r');
if (!$fp) {
    echo json_encode(["erro" => "Não foi possível abrir o arquivo."]);
    exit;
}

$resultados = [];

while (($linha = fgetcsv($fp, 1000, ",")) !== false) {
    // Garantir que a linha tem 8 campos
    if (count($linha) < 8) continue;

    // Mapear campos
    list($transportadora, $placa, $motorista, $rg, $nota, $pedido, $forn, $data) = $linha;

    // Filtros
    $matchNota = $notaFiscal === '' || stripos($nota, $notaFiscal) !== false;
    $matchPedido = $pedidoPO === '' || stripos($pedido, $pedidoPO) !== false;
    $matchFornecedor = $fornecedor === '' || stripos($forn, $fornecedor) !== false;
    $matchData = true;

    // Se intervalo de datas for fornecido, aplicar filtro
    if ($dataInicio !== '' && $dataFim !== '') {
        $dataTimestamp = strtotime(substr($data, 0, 10)); // Extrai data sem hora
        $inicioTimestamp = strtotime($dataInicio);
        $fimTimestamp = strtotime($dataFim);

        $matchData = ($dataTimestamp >= $inicioTimestamp && $dataTimestamp <= $fimTimestamp);
    }

    if ($matchNota && $matchPedido && $matchFornecedor && $matchData) {
        $resultados[] = $linha;
    }
}

fclose($fp);

// Retornar JSON
header('Content-Type: application/json');
echo json_encode($resultados);
?>
