export function stringGenerator(string) {
    return {
        string: string,
        length: string.length,
        position:0,
        current(){ return string[this.position]; },
        next(){ return string[++this.position]; },
        lookOut(offset) { return string[this.position+offset]; }, // char att offset relative to position
        match(char){ // increments if char matches, resets if not, returns true if end reached
            if (string[this.position]===char) {
                this.position++;
                if (string[this.position] === undefined) {
                    this.position = 0; // reset all keywords...!???!?!?
                    return true;
                }
            } else {
                this.position = 0;
            }
            return false;
        }
    }
}
