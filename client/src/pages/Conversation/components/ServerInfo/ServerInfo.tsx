import { useServerInfo } from "../../hooks/useServerInfo";

export const ServerInfo = () => {
  const { serverInfo } = useServerInfo();
  if (!serverInfo) {
    return null;
  }
  return (
    <div className="flex flex-col break-words gap-1">
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500"><span>TXT TMP:</span> <span>{serverInfo.text_temperature}</span></div>
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500"><span>TXT TOPK:</span> <span>{serverInfo.text_topk}</span></div>
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500"><span>AUD TMP:</span> <span>{serverInfo.audio_temperature}</span></div>
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500"><span>AUD TOPK:</span> <span>{serverInfo.audio_topk}</span></div>
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500"><span>PAD MULT:</span> <span>{serverInfo.pad_mult}</span></div>
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500"><span>REP PENALTY (Last N):</span> <span>{serverInfo.repetition_penalty_context}</span></div>
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500"><span>REP PENALTY:</span> <span>{serverInfo.repetition_penalty}</span></div>
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500 text-right"><span className="shrink-0 mr-2">LM Model File:</span> <span className="truncate">{serverInfo.lm_model_file}</span></div>
        <div className="flex justify-between border-b mx-1 px-1 border-gray-700/50 pb-1 mb-1 font-mono text-xs text-gray-500"><span className="shrink-0 mr-2">Instance Name:</span> <span className="truncate">{serverInfo.instance_name}</span></div>
    </div>
  );
};
