document.addEventListener('deviceready', splashscreen, false);

//injection of this function made splashscreen possible without tonnes of code, 2000 is 2 sec delay
function splashscreen() {
    console.log("function splashscreen");
    setTimeout(onDeviceReady, 2000);
}

//when this function executed it replaces page 1: Splashscreen with page 2: Login
function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    console.log("received deviceready");
    document.getElementById('deviceready').classList.add('ready');
    window.location.replace("#page2");
    console.log("movetoPage2 success");
}

document.getElementById("login-button").addEventListener("click", querybanksOBP);

//if statement was injected here in order to incorporate scenario when users will just press enter after they entered password
document.getElementById("pwd").addEventListener("keyup", function (loginkeypress) {
    if (loginkeypress.key === 'Enter') {
        console.log("function loginkeypress");
        querybanksOBP();
    }
});
document.getElementById("logout-button3").addEventListener("click", logoutOBP);
document.getElementById("logout-button4").addEventListener("click", logoutOBP);
document.getElementById("logout-button5").addEventListener("click", logoutOBP);
document.getElementById("submit-5").addEventListener("click", paymOBP);

//this function is linked to a Logout button within header of the app it does reload there for loging out user
function logoutOBP() {
    console.log("function logoutOBP");
    window.location.replace("#page1");
    window.location.reload();
    console.log("in logoutOBP success");
}

//Tokens below are for authentification purposes
var token;
var bank_id_token;
var account_id_token;

//Tokens below are for UX purposes
var bank_full_name_token; //this token show the banks name user picked on Accounts page
var account_label_token; //this token show the account name user picked on Transactions page

//async-await chain One, as soon as user clicks Login button next page loads, but as it is async, it will wait for the chain of async/await to execute
async function directloginOBP() {
    console.log("function directloginOBP");
    username = document.getElementById("uname").value;
    password = document.getElementById("pwd").value;
    document.getElementById("indicator").innerHTML = "Signing in ...";

    return $.ajax({
        url: "https://apisandbox.openbankproject.com/my/logins/direct",
        type: "POST",
        dataType:"json",
        crossDomain: true,
        cache: false,
        contentType:"application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin username="' + username + '\", password="' + password + '\", consumer_key="..."');
        },
        success: function( data, textStatus, jQxhr ){
            console.log("in directloginOBP success");
            document.getElementById("indicator").innerHTML = "🟢 All set ✔️";
            window.location.replace("#page3");
            console.log("movetoPage3 success");
            token = data.token; //functions are highest thing in JS, so in order to reuse auth token later it needs to be taken out as a variable
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("in directloginOBP error");
            document.getElementById("indicator").innerHTML = "🔴 Oops! Check your details ❌";
        }
    })
}

//async-await chain One
async function getcurrentuserOBP() {
    console.log("function getcurrentuserOBP");

    return $.ajax({
        url: "https://apisandbox.openbankproject.com/obp/v4.0.0/users/current",
        type: "GET",
        dataType:"json",
        crossDomain: true,
        cache: false,
        contentType:"application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function( data, textStatus, jQxhr ){
            console.log("in getcurrentuserOBP success");
            console.log(data);
            document.getElementById("querybankstext").innerHTML = "Hi, " + data.username + ".";
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("in getcurrentuserOBP error");
            document.getElementById("querybankstext").innerHTML = "Oops, we can't get your username";
        }
    })
}

//async-await chain One
async function querybanksOBP() {
    await directloginOBP();
    await getcurrentuserOBP();
    console.log("function querybanksOBP");

    $.ajax({
        url: "https://apisandbox.openbankproject.com/obp/v4.0.0/banks",
        type: "GET",
        dataType:"json",
        crossDomain: true,
        cache: false,
        contentType:"application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function( data, textStatus, jQxhr ){
            console.log("in querybanksOBP success");
            console.log(data);
            $("#tablebody").empty(); //this code helps to clear a table contents before loading any other data, this helps to avoid piling up to requested data
            data.banks.forEach(appendRow);
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("in querybanksOBP error");
            document.getElementById("querybankstext").innerHTML = "Oops! We can't get the list of banks, try again";
        }
    })
}

//async-await chain One
function appendRow(bank) {
    $("#tablebody").append("<tr><td><button onclick=output_bank('"+bank.id+"')>" + bank.full_name +"</button></td><td>" +
    bank.short_name + "</td><td>" + bank.id +"</td></tr>");
}

//async-await chain 2
async function output_bank(pickedbank) {
    console.log("Bank ID: "+pickedbank);
    window.location.replace("#page4");
    console.log("movetoPage4 success");
    bank_id_token = pickedbank
    await queryaccOBP();
    await querybanknameOBP();
}

//async-await chain 2
async function querybanknameOBP() {
    console.log("function querybanknameOBP");

    return $.ajax({
        url: 'https://apisandbox.openbankproject.com/obp/v4.0.0/banks/' + bank_id_token,
        type: "GET",
        dataType:"json",
        crossDomain: true,
        cache: false,
        contentType:"application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function( data, textStatus, jQxhr ){
            console.log("in querybanknameOBP success");
            console.log(data);
            document.getElementById("pickedbanktext").innerHTML = "Your accounts at " + data.full_name + ".";
            bank_full_name_token = data.full_name
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("in querybanknameOBP error");
            document.getElementById("pickedbanktext").innerHTML = "Oops! Something went wrong, go back and try to choose your bank again";
        }
    })
}

//async-await chain 2
async function queryaccOBP() {
    console.log("function queryaccOBP");

    return $.ajax({
        url: 'https://apisandbox.openbankproject.com/obp/v4.0.0/banks/' + bank_id_token + '/balances',
        type: "GET",
        dataType:"json",
        crossDomain: true,
        cache: false,
        contentType:"application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function( data, textStatus, jQxhr ){
            console.log("in queryaccOBP success");
            console.log(data);
            $("#tablebody2").empty();
            data.accounts.forEach(appendRow2);
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("in queryaccOBP error");
            document.getElementById("queryacctext").innerHTML = "Oops! We can't get your account details, try again";
        }
    })
}

//async-await chain 2
function appendRow2(account) {
    $("#tablebody2").append("<tr><td><button onclick=output_account('"+account.account_id+"')>" + account.label +"</button></td><td>" +
    account.balances[0].amount + " " + account.balances[0].currency + "</td></tr>");
    account_label_token = account.label
}

//async-await chain THREE
async function output_account(pickedaccount) {
    console.log("Account ID: "+pickedaccount);
    window.location.replace("#page5");
    console.log("movetoPage5 success");
    account_id_token = pickedaccount
    await querytransactionsOBP();
    await queryaccountnameOBP();
}

//async-await chain THREE
async function queryaccountnameOBP() {
    console.log("function queryaccountnameOBP");

    return $.ajax({
        url: 'https://apisandbox.openbankproject.com/obp/v4.0.0/my/banks/' + bank_id_token + '/accounts/' + account_id_token + '/account',
        type: "GET",
        dataType:"json",
        crossDomain: true,
        cache: false,
        contentType:"application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function( data, textStatus, jQxhr ){
            console.log("in queryaccountnameOBP success");
            console.log(data);
            document.getElementById("pickedaccounttext").innerHTML = "Your " + data.label + " at " + bank_full_name_token + ".";
            document.getElementById("accountname").innerHTML = "" + data.label + "";
            document.getElementById("accountbalance").innerHTML = "" + data.balance.amount + " "+ data.balance.currency;
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("in queryaccountnameOBP error");
            document.getElementById("pickedaccounttext").innerHTML = "Oops! Something went wrong, go back and try to choose your account again";
        }
    })
}

//async-await chain THREE
async function querytransactionsOBP() {
    console.log("function querytransactionsOBP");

    return $.ajax({
        url: 'https://apisandbox.openbankproject.com/obp/v4.0.0/my/banks/'+ bank_id_token +'/accounts/'+ account_id_token +'/transactions',
        type: "GET",
        dataType:"json",
        crossDomain: true,
        cache: false,
        contentType:"application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function( data, textStatus, jQxhr ){
            console.log("in querytransactionsOBP success");
            console.log(data);
            $("#tablebody3").empty();
            data.transactions.forEach(appendRow3);
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("in querytransactionsOBP error");
            document.getElementById("querytransactionstext").innerHTML = "Oops! We can't get your latest transactions, try again";
        }
    })
}

//async-await chain THREE
function appendRow3(transactions) {
    $("#tablebody3").append("<tr><td>" + transactions.details.type +"</td><td>" +
    transactions.details.completed + "</td><td>" + 
    transactions.details.value.amount + " " + transactions.details.value.currency +"</td><td>" + 
    transactions.details.new_balance.amount + " " + transactions.details.new_balance.currency +"</td></tr>");
}

function paymOBP() {
    console.log("function paymOBP");
    paym_bank = document.getElementById("paym-bank").value;
    paym_acc = document.getElementById("paym-acc").value;
    paym_amount = document.getElementById("paym-amount").value;
    paym_ref = document.getElementById("paym-ref").value;

    $.ajax({
        url: 'https://apisandbox.openbankproject.com/obp/v4.0.0/banks/'+ bank_id_token +'/accounts/'+ account_id_token +'/owner/transaction-request-types/SANDBOX_TAN/transaction-requests',
        type: "POST",
        dataType:"json",
        data: JSON.stringify({"to": {"bank_id": paym_bank, "account_id": paym_acc}, "value":{"currency":"GBP","amount": paym_amount}, "description": paym_ref}), //in order to post data I had to Stringify Json data I send
        crossDomain: true,
        cache: false,
        contentType:"application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function( data, textStatus, jQxhr ){
            console.log("in paymOBP success");
            console.log(data);
            document.getElementById("querytransactionstext").innerHTML = "Yay! 🟢 Payment successful ✔️";
            window.location.replace("#page5"); //this code helps to keep user on Page 5 after Confirm button clicked in Transfer Money popup
            querytransactionsOBP();
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("in paymOBP error");
            document.getElementById("querytransactionstext").innerHTML = "Oops! 🔴 Payment failed ❌";
            window.location.replace("#page5"); //this code helps to keep user on Page 5 after Confirm button clicked in Transfer Money popup
        }
    })
}