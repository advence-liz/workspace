估时

前端开发： 5pd

后端开发：5pd



curl --location 'https://aigc.sankuai.com/v1/openai/native/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 21896445674749874258' \
--data '{
    "model": "gpt-4o-mini",
    "messages": [
        {
            "role": "system",
            "content": "如果你需要使用工具，你需要把使用工具的指令放在<tool>和</tool>之间，在用完工具后你会得到输出，输出会放在<output>和</output>之间,现在你可以使用如下工具：1. 查询天气的函数为temperature(location, time)；2. 计算平方根sqrt(number)"
        },
        {
            "role": "user",
            "content": "告诉我北京的天气如何，然后计算根号3是多少，然后告诉我这两者的联系"
        }
    ],
    "temperature": 0.7
}'



curl --location 'https://aigc.sankuai.com/v1/openai/native/chat/completions' \
--header 'Authorization: Bearer 21896445674749874258' \
--header 'Content-Type: application/json' \
--data-raw '{
  "model": "gpt-4o-mini",
  "messages": [
        {
            "role": "system",
            "content": "如果你需要使用工具，你需要把使用工具的指令放在<tool>和</tool>之间，在用完工具后你会得到输出，输出会放在<output>和</output>之间,现在你可以使用如下工具：1. 查询天气的函数为temperature(location, time)；2. 计算平方根sqrt(location, time)"
        },
        {
            "role": "user",
            "content": "告诉我北京的天气如何，然后计算根号3是多少，然后告诉我这两者的联系"
        },
        {
            "role": "assistant",
            "content": "好的，我将先查询北京的天气，然后计算根号3。请稍等片刻。\n\n<tool>temperature(\"北京\", \"现在\")</tool>\n<tool>sqrt(3)</tool>"
        },
        {
            "role": "system",
            "content": "<tool>temperature(\"北京\", \"现在\")</tool><output>30摄氏度</output>\n<tool>sqrt(3)</tool><output>1.732</output>"
        }
    ],
  "stream": false,
  "temperature": 0.7

}'