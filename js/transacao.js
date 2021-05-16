function iniciarSessao() {

    $.ajax({
        url: "http://localhost:8080/transactions/getSessao",
        type: 'POST',
        dataType: 'json',
        success: function (data) {
            console.log(data.session.id);
            PagSeguroDirectPayment.setSessionId(data.session.id);
        },
        complete: function (response) {
            //getMetodosPagamentos();
            getTokenCartao();
        }
    })
}

//Pega o hash do cartão
$("#Form1").on('submit', function (event) {
    event.preventDefault();
    checkTransacao();
});

function checkTransacao() {
    $.ajax({
        url: "http://localhost:8080/transactions/consultarTransacao/" + $('#referencia').val(),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log(data.transactionSearchResult.transactions.transaction.date);
        },
        complete: function (data) {
            var date = new Date(data.responseJSON.transactionSearchResult.transactions.transaction.date);
            var valor = data.responseJSON.transactionSearchResult.transactions.transaction.grossAmount;
            var status = data.responseJSON.transactionSearchResult.transactions.transaction.status;
            var code = data.responseJSON.transactionSearchResult.transactions.transaction.code;
            $('#dataTransacao').val(dataAtualFormatada(date));
            $('#valorTransacao').val("R$ " + valor.toFixed(2).replace(".", ","));
            $('#statusTransacao').val(getStatusPagamento(status));
            $('#codTransacao').val(code);

            checkStatus(status);
        }
    })
}

function dataAtualFormatada(data) {
    dia = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0' + dia : dia,
        mes = (data.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0' + mes : mes,
        anoF = data.getFullYear();
    return diaF + "/" + mesF + "/" + anoF + " - " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
}

function checkStatus(status) {
    if(status == 5 || status == 6 || status == 3) {
        $("#extornarPagamentoBtn").prop('disabled',false);
        $("#botaoConfirmar").prop('disabled',true);
        $("#botaoCancelar").prop('disabled',true);
    } else if (status == 1) {
        $("#botaoConfirmar").prop('disabled',false);
        $("#extornarPagamentoBtn").prop('disabled',true);
        $("#botaoCancelar").prop('disabled',false);
    } else if(status == 2) {
        $("#botaoCancelar").prop('disabled',false);
        $("#botaoConfirmar").prop('disabled',true);
        $("#extornarPagamentoBtn").prop('disabled',true);
    }
}

function getStatusPagamento(status) {
    switch (status) {
        case 1:
            return "Aguardando pagamento";
        case 2:
            return "Em análise";
        case 3:
            return "Paga";
        case 4:
            return "Aguardando pagamento";
        case 5:
            return "Disponível";
        case 6:
            return "Em disputa";
        case 7:
            return "Devolvida";
        case 8:
            return "Cancelada";
    }
}

$( "#botaoConfirmar" ).click(function() {

    $.ajax({
        traditional: true,
        url: "http://localhost:8080/transactions/confirmarPagamento",
        data: { 
            'cod': $('#codTransacao').val()
        },
        type: 'POST',
        dataType: 'json',
        success: function (data) {
            alert(data.statusCode+" "+data.reasonPhrase);
        },
        complete: function (data) {
            return false;
        }
    })
});

$( "#botaoCancelar" ).click(function() {

    $.ajax({
        traditional: true,
        url: "http://localhost:8080/transactions/cancelarPagamento",
        data: { 
            'cod': $('#codTransacao').val()
        },
        type: 'POST',
        dataType: 'json',
        success: function (data) {
            alert(data.statusCode+" "+data.reasonPhrase);
        },
        complete: function (data) {
            return false;
        }
    })
});


$( "#extornarPagamentoBtn" ).click(function() {

    $.ajax({
        traditional: true,
        url: "http://localhost:8080/transactions/extornarPagamento",
        data: { 
            'cod': $('#codTransacao').val()
        },
        type: 'POST',
        dataType: 'json',
        success: function (data) {
            alert(data.statusCode+" "+data.reasonPhrase);
        },
        complete: function (data) {
            return false;
        }
    })
});


function extornarPagamento() {

    $.post('http://localhost:8080/transactions/extornarPagamento', { cod: $('#codTransacao').val()}, 
    function(returnedData){
         console.log(returnedData);
    });    
}