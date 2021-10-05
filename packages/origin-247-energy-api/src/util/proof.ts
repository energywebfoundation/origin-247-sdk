import { PreciseProofs } from 'precise-proofs-js';
import { Reading } from '.';

export interface IReadingsProof {
    readings: Reading[];
    rootHash: string;
    leafs: PreciseProofs.Leaf[];
    salts: string[];
}

export class PreciseProofUtils {
    static generateProofs(readings: Reading[], salts?: string[]): IReadingsProof {
        let leafs = salts
            ? PreciseProofs.createLeafs(readings, salts)
            : PreciseProofs.createLeafs(readings);

        leafs = PreciseProofs.sortLeafsByKey(leafs);

        const merkleTree = PreciseProofs.createMerkleTree(
            leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash)
        );

        return {
            readings,
            rootHash: PreciseProofs.getRootHash(merkleTree),
            salts: leafs.map((leaf: PreciseProofs.Leaf) => leaf.salt),
            leafs
        };
    }
}
