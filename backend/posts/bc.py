from eth_hash.auto import keccak

def compute_post_hash(username, date, title, content):
    return keccak((username + date + title + content).encode('utf-8'))

