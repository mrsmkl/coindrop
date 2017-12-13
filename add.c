

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

struct data {
    uint8_t *addr;
    uint8_t *value;
    uint8_t *x;
    uint8_t *y;
};

uint8_t hexChar(char c) {
    switch (c) {
        case '0': return 0;
        case '1': return 1;
        case '2': return 2;
        case '3': return 3;
        case '4': return 4;
        case '5': return 5;
        case '6': return 6;
        case '7': return 7;
        case '8': return 8;
        case '9': return 9;
        case 'a': return 10;
        case 'b': return 11;
        case 'c': return 12;
        case 'd': return 13;
        case 'e': return 14;
        case 'f': return 15;
        default: return 0;
    }
}

uint8_t *fromHex(char *str) {
    uint8_t *res = malloc(32);
    for (int i = 0; i < 32; i++) {
        if (!(*str)) break;
        res[i] = hexChar(*str)*16;
        str++;
        if (!(*str)) break;
        res[i] += hexChar(*str);
        str++;
    }
    return res;
}

int main(int argc, char **argv) {
    // Load data from file
    if (argc < 2) {
        printf("Usage: ./add.out <fname>\n");
        return 1;
    }
    FILE *output = fopen(argv[1], "wb");
    if (!output) {
        fprintf(stderr, "Error: Cannot open %s for writing\n", argv[2]);
        return 1;
    }
    
    struct data record;
    record.addr =  fromHex("0000000000000000000000000000000000000000000bd3492fed4387b3581232");
    record.value = fromHex("0000000000000000000000000000000000000000000123200000000000000000");
    record.x =     fromHex("0000000000000000000000000000000000000000000000000000000000001232");
    record.y =     fromHex("0000000000000000000000000000000000000000000000000000000000001232");
    fwrite(record.addr, 1, 32, output);
    fwrite(record.value, 1, 32, output);
    fwrite(record.x, 1, 32, output);
    fwrite(record.y, 1, 32, output);
    fclose(output);
    return 0;
}

