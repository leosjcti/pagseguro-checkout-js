
var valor = 300.00;

function iniciarSessao() {

    $.ajax({
        url: "http://localhost:8080/checkout/getSessao",
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data.session.id);
            PagSeguroDirectPayment.setSessionId(data.session.id);
        },
        complete: function(response) {
            //getMetodosPagamentos();
            getTokenCartao();
        }
    })
}

/*function getMetodosPagamentos() {
    PagSeguroDirectPayment.getPaymentMethods({
        amount: valor,
        success: function(data) {
            $.each(data.paymentMethods.CREDIT_CARD.options, function(i, obj){
                $('.CartaoCredito').append("<div><img src=https://stc.pagseguro.uol.com.br/"+obj.images.SMALL.path+">"+obj.name+"</div>");
            });

            $('.Boleto').append("<div><img src=https://stc.pagseguro.uol.com.br/"+data.paymentMethods.BOLETO.options.BOLETO.images.SMALL.path+">"+data.paymentMethods.BOLETO.name+"</div)");

            $.each(data.paymentMethods.ONLINE_DEBIT.options, function(i, obj){
                $('.Debito').append("<div><img src=https://stc.pagseguro.uol.com.br/"+obj.images.SMALL.path+">"+obj.name+"</div>");
            });
        },
        complete: function(response) {
            getTokenCartao();
        }
    });
}*/

$('#numeroCartao').on('blur',function(){
    var numeroCartao=$(this).val();
    var QtdCaracteres=numeroCartao.length;

    if(QtdCaracteres >= 6){
        PagSeguroDirectPayment.getBrand({
            cardBin: numeroCartao,
            success: function(response) {
                var BandeiraImg=response.brand.name;
                $('#bandeiraCartao').val(BandeiraImg);
                $('.BandeiraCartao').html("<img src=https://stc.pagseguro.uol.com.br/public/img/payment-methods-flags/42x20/"+BandeiraImg+".png>")
                getQtdParcelas(BandeiraImg);
            },
            error: function (response) {
                alert('Cartão não reconhecido');
                $('.BandeiraCartao').empty();
            }
        });
    } else {
        alert("Cartão inválido");
    }
});


function getQtdParcelas(bandeira) {
    PagSeguroDirectPayment.getInstallments({
        amount: valor,
        maxInstallmentNoInterest: 2,
        brand: bandeira,
        success: function(response)
        {
            console.log(response);
            $.each(response.installments,function(i,obj){
                $.each(obj,function(i2,obj2){
                    var NumberValue=obj2.installmentAmount;
                    var Number= "R$ "+ NumberValue.toFixed(2).replace(".",",");
                    var NumberParcelas= NumberValue.toFixed(2);
                    //$('#qtdParcelas').show().append("<option value='"+obj2+"'>"+obj2.quantity+" parcelas de "+Number+"</option>");
                    $('#qtdParcelas').show().append("<option value='"+obj2.quantity+"' title='"+NumberParcelas+"'>"+obj2.quantity+" parcelas de "+Number+"</option>");
                });
            });
        }
    });
}

//Pegar o valor da parcela
$("#qtdParcelas").on('change',function(){
    var ValueSelected=document.getElementById('qtdParcelas');
    $("#valorParcelas").val(ValueSelected.options[ValueSelected.selectedIndex].title);
});


//Chamar a função do token
$('#cvv').on('blur', function(){
    getTokenCartao();
})


//Obter o token do cartão de crédito
function getTokenCartao()
{
    console.log($('#numeroCartao').val()+" "+$('#bandeiraCartao').val()+" "+ $('#cvv').val()+ " "+$('#mesValidade').val()+" "+$('#anoValidade').val());
    
    PagSeguroDirectPayment.createCardToken({
        cardNumber: $('#numeroCartao').val(),
        brand: $('#bandeiraCartao').val(),
        cvv: $('#cvv').val(),
        expirationMonth: $('#mesValidade').val(),
        expirationYear: $('#anoValidade').val(),
        success: function(response)
        {
           $('#tokenCard').val(response.card.token);
        }
    });
}

//Pega o hash do cartão
$("#Form1").on('submit',function(event){
    event.preventDefault();
    PagSeguroDirectPayment.onSenderHashReady(function(response){
        $("#hashCard").val(response.senderHash);

        if(response.status=='success'){
        	//$("#Form1").trigger('submit');
            processarCheckout();
		}
    });
});


function processarCheckout() {
    /*$.post("http://localhost:8080/checkout/processar", {

        tokenCard: $("#tokenCard").val(), 
        hashCard: $("#hashCard").val()

    }, function() {
        console.log("Deu certo")
    }) .fail(function (data) {
        console.log(data)
    });*/

    var dadosJson = JSON.stringify({
        "nomeComprador": $('#nomeComprador').val(),
        "cpfComprador": $('#cpfComprador').val(),
        "ddd" : $('#ddd').val(),
        "telefone" : $('#telefone').val(),
        "cep": $('#cep').val(),
        "endereco": $('#endereco').val(),
        "numero" : $('#numero').val(),
        "complemento" : $('#complemento').val(),
        "bairro" : $('#bairro').val(),
        "cidade" : $('#cidade').val(),
        "uf" : $('#uf').val(),
        "tokenCard": $('#tokenCard').val(),
        "hashCard": $('#hashCard').val(),
        "installmentQuantity" : $('#qtdParcelas').val(),
        "installmentValue" : $('#valorParcelas').val(),
        "ref" : $('#ref').val()
      });
    
    $.ajax({
        //url: "http://localhost:8080/checkout/processarSplit",
        url: "http://localhost:8080/checkout/processar",
        data: dadosJson,
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json' 
        },
        type: 'POST',
        dataType: 'json',
        success: function(data) {
            console.log(data.session.id);
            //PagSeguroDirectPayment.setSessionId(data.session.id);
        },
        complete: function(response) {
            //getMetodosPagamentos();
            //getTokenCartao();
        }
    })


    
       
}



iniciarSessao();