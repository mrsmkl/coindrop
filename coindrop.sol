
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
   }

   mapping (uint => Block) blocks;
   mapping (uint => uint) task_to_block;

   function Coindrop(address tb, address fs, string code_address, bytes32 init_hash, bytes32 next_state) public {
      truebit = TrueBit(tb);
      filesystem = Filesystem(fs);
      code = code_address;     // address for wasm file in IPFS
      init = init_hash;        // the canonical hash
      initBlock(block.number);
      Block storage b = blocks[block.number];
      b.next_state = next_state;
   }

   // There will probably be some kind of magic positions for special actions like reserving buckets
   function addCoin(int x, int y) payable public {
      initBlock(block.number);
      Block storage b = blocks[block.number];
      b.inputs.push(bytes32(msg.sender));
      b.inputs.push(bytes32(x));
      b.inputs.push(bytes32(y));
      b.inputs.push(bytes32(msg.value));
   }

   function idToString(bytes32 id) public pure returns (string) {
      bytes memory res = new bytes(64);
      for (uint i = 0; i < 64; i++) res[i] = bytes1(((uint(id) / (2**(4*i))) & 0xf) + 65);
      return string(res);
   }

   // first input is the number of the block
   function initBlock(uint num) internal {
      Block storage b = blocks[num];
      if (b.inputs.length > 0) return;
      b.inputs.push(bytes32(num));
   }

   function submitBlock(uint num) public {
      require(block.number > num);
      Block storage b = blocks[num];
      Block storage last = blocks[num-1];
      b.input_file = filesystem.createFileWithContents("input.dta", num, b.inputs, b.inputs.length*32);
      b.bundle = filesystem.makeBundle(num);
      filesystem.addToBundle(b.bundle, b.input_file);
      filesystem.addToBundle(b.bundle, last.next_state);
      filesystem.finalizeBundleIPFS(b.bundle, code, init);
      
      b.task = truebit.add(filesystem.getInitHash(b.bundle), 0, 1, idToString(b.bundle));
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

}
