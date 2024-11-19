import os


def printdir(root_dir, prefix=""):
    try:
        entries = sorted(os.listdir(root_dir))

        for index, entry in enumerate(entries):
            is_last = index == len(entries) - 1
            connector = "└── " if is_last else "├── "
            print(f"{prefix}{connector}{entry}")

            path = os.path.join(root_dir, entry)
            if os.path.isdir(path):
                new_prefix = prefix + ("    " if is_last else "│   ")
                printdir(path, new_prefix)
    except Exception as e:
        print("error: ", e)


root_directory = '.'
printdir(root_directory)
