#include <node.h>

#include <iostream>
#include <sstream>

#include <unistd.h>
#include <sys/socket.h>
#include <bluetooth/bluetooth.h>
#include <bluetooth/rfcomm.h>


using namespace v8;



typedef long long int lli;

const char *intToChar(lli number){
    /* This Function is use to create an hex string from a number), so it can be pass as parameter to the socket */
    std::stringstream ss(std::stringstream::in | std::stringstream::out);
    ss << "0x" << std::hex << number;
    return ss.str().c_str();
}

int soukette;
char serverMAC[18];

Handle<Value> connectBT(const Arguments& args)
{
    HandleScope scope;
    /* Variables For the Bluetooth Connection */
    struct sockaddr_rc addr = {0};
    //char serverMAC[18] = "8C:DE:52:05:15:D4"; // MAC adress of our Helicoptere 00:11:67:E4:16:FF
    int status; // Two socket handler
    //int soukette;


    /* Handle Bluetooth Connection */
    soukette = socket(AF_BLUETOOTH, SOCK_STREAM, BTPROTO_RFCOMM); // See the article for more details
    addr.rc_family = AF_BLUETOOTH;
    addr.rc_channel = (uint8_t)6;
    str2ba(serverMAC, &addr.rc_bdaddr);

    status = connect(soukette, (struct sockaddr *)&addr, sizeof(addr));
    //status=0;

    printf("connected to the BT helico");
    return scope.Close(Integer::New(status));
}  //end connectBT()



Handle<Value> setBTDATA(const Arguments& args)
{
    HandleScope scope;

    int status;
    lli prefixe = 0x150000000000; // See the article for more details
    lli suffixe = 0x0000000000FF;
    lli firstRotorSpeed = 0x0000000000;
    lli secondRotorSpeed= 0x0000000000;
    lli trimmerValue = 0x0000;
    lli turnValue=0x0000;

    lli trimmerCoeff = 0x0800; // Trimmer Modification

    lli command; // Final Command sent to the Heli
    int trimmerPosition = 0; // 0 = Null, 1 = Positif (right), -1 (negative)

    if (args.Length() < 1) {
        // No argument was passed. Throw an exception to alert the user to
        // incorrect usage. Alternatively, we could just use 0.
        return ThrowException(
            Exception::TypeError(String::New("First argument must be a number"))
        );
    }

    status=0;
    Local<Integer> vx = args[0]->ToInteger();
    int32_t vxVal = vx->Value();

    Local<Integer> vz = args[1]->ToInteger();
    int32_t vzVal = vz->Value();

    Local<Integer> vy = args[2]->ToInteger();
    int32_t vyVal = vy->Value();

    Local<Integer> vTrim = args[3]->ToInteger();
    int32_t vTrimVal = vTrim->Value();

    Local<Integer> vyFront = args[4]->ToInteger();
    int32_t vyFrontVal = vyFront->Value();

    Local<Integer> vyBack = args[5]->ToInteger();
    int32_t vyBackVal = vyBack->Value();

    Local<Integer> vBalance = args[6]->ToInteger();
    int32_t vBalanceVal = vBalance->Value();


    int64_t vTrimcool=vTrimVal;

    //if (vTrimVal == 0){   
    //    trimmerValue=0;     
    //prefixe = 0x150000000000;
    //} else if (vTrimVal>0){
    //    trimmerValue=vTrimcool<<8;
    //    prefixe = 0x170000000000;
    //} else if (vTrimVal<0) {
    //    trimmerValue=-(vTrimcool<<8);
    //    prefixe = 0x140000000000;
    //}

    int64_t vxcool=vxVal;
    int64_t vzcool=vzVal;
    int64_t vycool=vyVal;
    int64_t vyFrontcool=vyFrontVal;
	int64_t vyBackcool=vyBackVal;
	int64_t vBalancecool=vBalanceVal;



    trimmerValue=vTrimcool<<8;
    turnValue =  vxcool <<16;
    secondRotorSpeed=vycool << 24;
    firstRotorSpeed=vzcool << 32;
    prefixe=((vyFrontcool<<6) + (vyBackcool<<4) + vBalancecool) << 40;
    

    //prefixe : en binaire
    //4 premiers bits : 
    // 1100 ->avant
    // 0011 -> arriere
    //doit etre different de 0 (au moins 1)

    //4 bits suivants :
    //0000 -> seule l'hélice du dessus tourne
    //1111 -> seule l'hélice de dessous tourne

    //valeur idéale : 5

    command = prefixe + firstRotorSpeed + secondRotorSpeed + turnValue + trimmerValue + suffixe;
    printf("%s \n", intToChar(command));
    //printf("command %i \n", command);
    //printf("vx %i, vz %i , n %i \n", trimmerValue, firstRotorSpeed, args.Length());
    fflush(stdout);
    //std::cout << intToChar(command) << std::endl;
    
    status = write(soukette, intToChar(command), 14); // We know that we have to send 14 bytes by analysing the requests
    
    return scope.Close(Integer::New(status));
} //end setBTDATA()


Handle<Value> setMAC(const Arguments& args)
{
    HandleScope scope;
    Local<String> serverV8 = args[0]->ToString();
    String::AsciiValue plapp(serverV8);
    strcpy(serverMAC, *plapp);

    return scope.Close(Integer::New(0));
} //end setMAC()

Handle<Value> setHexa(const Arguments& args)
{
    HandleScope scope;
    
    lli command; // Final Command sent to the Heli
    
    Local<Integer> v8valz = args[0]->ToInteger();
    int64_t valz = v8valz->Value();
    command=valz;
    
    printf("hexa - %s \n", intToChar(command));
    fflush(stdout);
    
    int status;
    status = write(soukette, intToChar(command), 14); // We know that we have to send 14 bytes by analysing the requests
    
    return scope.Close(Integer::New(status));
} //end setHexa()

void RegisterModule(Handle<Object> target) {
    target->Set(String::NewSymbol("connectBT"),
        FunctionTemplate::New(connectBT)->GetFunction());
    target->Set(String::NewSymbol("setBTDATA"),
        FunctionTemplate::New(setBTDATA)->GetFunction());
    target->Set(String::NewSymbol("setMAC"),
        FunctionTemplate::New(setMAC)->GetFunction());   
    target->Set(String::NewSymbol("setHexa"),
        FunctionTemplate::New(setHexa)->GetFunction());
}

NODE_MODULE(helicoJS, RegisterModule);
