cmd_Release/obj.target/helicoJS.node := flock ./Release/linker.lock g++ -shared -pthread -rdynamic -m64  -Wl,-soname=helicoJS.node -o Release/obj.target/helicoJS.node -Wl,--start-group Release/obj.target/helicoJS/helicoJS.o -Wl,--end-group -lbluetooth
