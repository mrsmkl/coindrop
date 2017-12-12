
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

struct data {
    uint8_t *addr;
    uint8_t *value;
    uint8_t *x;
    uint8_t *y;
};

uint8_t *get_bytes32(FILE *f) {
    uint8_t *res = malloc(32);
    int ret = fread(res, 1, 32, f);
    if (ret != 32) {
        free(res);
        return 0;
    }
    return res;
}

// read record
struct data get_data(FILE *f) {
    struct data res;
    res.addr = get_bytes32(f);
    res.value = get_bytes32(f);
    res.x = get_bytes32(f);
    res.y = get_bytes32(f);
    return res;
}

int main(int argc, char **argv) {
    // Load data from file
    FILE *input = fopen("input.data", "rb");
    if (!input) {
        fprintf(stderr, "Error: Cannot read input.data\n");
        return 1;
    }
    FILE *output = fopen("output.data", "wb");
    if (!output) {
        fprintf(stderr, "Error: Cannot open output.data for writing\n");
        return 1;
    }
    
    while (1) {
        struct data record = get_data(input);
        if (record.addr == 0) break;
        
        fwrite(record.addr, 1, 32, output);
        fwrite(record.value, 1, 32, output);
        
    }
    fclose(input);
    fclose(output);
    return 0;
}


