{
  "targets": [
    {
      "target_name": "helicoJS",
      "sources": [ "helicoJS.cpp" ],
      "cflags_cc!": ["-lbluetooth"],
      "cflags!": ["-lbluetooth"],
      'libraries': ['-lbluetooth']   
    }
  ]
}
