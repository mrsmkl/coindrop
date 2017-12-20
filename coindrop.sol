
pragma solidity ^0.4.16;

interface Filesystem {

   function createFileWithContents(string name, uint nonce, bytes32[] arr, uint sz) public returns (bytes32);
   function getSize(bytes32 id) public view returns (uint);
   function forwardData(bytes32 id, address a) public;
   
   // function makeSimpleBundle(uint num, address code, bytes32 code_init, bytes32 file_id) public returns (bytes32);
   
   function makeBundle(uint num) public view returns (bytes32);
   function addToBundle(bytes32 id, bytes32 file_id) public returns (bytes32);
   function finalizeBundleIPFS(bytes32 id, string file, bytes32 init) public;
   function getInitHash(bytes32 bid) public view returns (bytes32);
   
}

interface TrueBit {
   function add(bytes32 init, /* CodeType */ uint8 ct, /* Storage */ uint8 cs, string stor) public returns (uint);
   function addWithParameters(bytes32 init, /* CodeType */ uint8 ct, /* Storage */ uint8 cs, string stor, uint8 stack, uint8 mem, uint8 globals, uint8 table, uint8 call) public returns (uint);
   function requireFile(uint id, bytes32 hash, /* Storage */ uint8 st) public;
}

contract Coindrop {

   uint nonce;
   TrueBit truebit;
   Filesystem filesystem;

   string code;
   bytes32 init;

   // the user input is associated with blocks
   struct Block {
      bytes32[] inputs;
      bytes32[] settled;
      bytes32 next_state;
      bytes32 input_file;
      bytes32 bundle;
      uint task;
      uint last;
   }

   mapping (uint => Block) blocks;
   mapping (uint => uint) task_to_block;
   
   uint current;

   function Coindrop(address tb, address fs, string code_address, bytes32 init_hash, bytes32 next_state) public {
      truebit = TrueBit(tb);
      filesystem = Filesystem(fs);
      code = code_address;     // address for wasm file in IPFS
      init = init_hash;        // the canonical hash
      blocks[block.number].inputs.push(bytes32(block.number));
      blocks[0].next_state = next_state;
      current = block.number;
   }

   // There will probably be some kind of magic positions for special actions like reserving buckets
   function addCoin(int x, int y) payable public {
      initBlock(block.number);
      Block storage b = blocks[current];
      b.inputs.push(bytes32(msg.sender));
      b.inputs.push(bytes32(x));
      b.inputs.push(bytes32(y));
      b.inputs.push(bytes32(msg.value));
   }

   // first input is the number of the block
   function initBlock(uint num) internal {
      if (blocks[current].task == 0) return;
      Block storage b = blocks[num];
      if (b.inputs.length > 0) return;
      b.inputs.push(bytes32(num));
      b.last = current;
      current = num;
   }
   
   function checkInput() public view returns (bytes32[]) {
      return blocks[current].inputs;
   }

   function submitBlock() public {
      uint num = current;
      Block storage b = blocks[num];
      require(block.number > num && b.task == 0);
      Block storage last = blocks[b.last];
      b.input_file = filesystem.createFileWithContents("input.data", num, b.inputs, b.inputs.length*32);
      b.bundle = filesystem.makeBundle(num);
      filesystem.addToBundle(b.bundle, b.input_file);
      filesystem.addToBundle(b.bundle, last.next_state);
      filesystem.finalizeBundleIPFS(b.bundle, code, init);
      
      b.task = truebit.addWithParameters(filesystem.getInitHash(b.bundle), 1, 1, idToString(b.bundle), 20, 25, 8, 20, 10);
      truebit.requireFile(b.task, hashName("output.data"), 1);
      truebit.requireFile(b.task, hashName("state.data"), 0);
      task_to_block[b.task] = num;
   }

   uint remember_task;

   function consume(bytes32, bytes32[] arr) public {
      require(TrueBit(msg.sender) == truebit);
      Block storage b = blocks[remember_task];
      b.settled = arr;
   }

   // this is the callback name
   function solved(uint id, bytes32[] files) public {
      // could check the task id
      remember_task = task_to_block[id];
      filesystem.forwardData(files[1], this);
      Block storage b = blocks[remember_task];
      b.next_state = files[2];
   }

   // need some way to get next state, perhaps shoud give all files as args
   function pull(uint num, uint idx) public {
      Block storage b = blocks[num];
      require(b.settled[idx*2] == bytes32(msg.sender));
      uint v = uint(b.settled[idx*2+1]);
      b.settled[idx*2+1] = bytes32(0);
      msg.sender.transfer(v);
   }
   
   ///// Utils

   function idToString(bytes32 id) public pure returns (string) {
      bytes memory res = new bytes(64);
      for (uint i = 0; i < 64; i++) res[i] = bytes1(((uint(id) / (2**(4*i))) & 0xf) + 65);
      return string(res);
   }

   function makeMerkle(bytes arr, uint idx, uint level) internal pure returns (bytes32) {
      if (level == 0) return idx < arr.length ? bytes32(uint(arr[idx])) : bytes32(0);
      else return keccak256(makeMerkle(arr, idx, level-1), makeMerkle(arr, idx+(2**(level-1)), level-1));
   }

   function calcMerkle(bytes32[] arr, uint idx, uint level) internal returns (bytes32) {
      if (level == 0) return idx < arr.length ? arr[idx] : bytes32(0);
      else return keccak256(calcMerkle(arr, idx, level-1), calcMerkle(arr, idx+(2**(level-1)), level-1));
   }

   // assume 256 bytes?
   function hashName(string name) public pure returns (bytes32) {
      return makeMerkle(bytes(name), 0, 8);
   }

}
